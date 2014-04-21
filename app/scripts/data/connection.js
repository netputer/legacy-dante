define([
    'underscore'
    ], function(
    _
    ) {
'use strict';
return ['GA', 'wdDevice', '$q', '$http', 'wdDev', '$timeout', 'wdSocket', '$rootScope',
function(GA,   wdDevice,   $q,   $http,   wdDev,   $timeout,   wdSocket,   $rootScope) {
    var TIME_SPAN = 3000;
    var connectDeviceTimes;

    function resetMaxconnectTrytimes(times) {
        connectDeviceTimes = times || 4;
    }
    resetMaxconnectTrytimes();

    // if connect success totalRetryConnectNum will be 0
    var totalRetryConnectNum = -1;
    
    // return http error reason
    function getHttpErrorReason(timeout, httpStatus, startTime) {
        var action;
        var duration = Date.now() - startTime;
        if (httpStatus === 0) {
            action = (Math.round(duration / 1000) * 1000 < timeout) ? ('unreached:' + duration) : 'timeout';
        } else if (httpStatus === 401) {
            action = 'reject:' + duration;
        } else {
            action = 'unknown_' + httpStatus + ':' + duration;
        }
        return action;
    }

    var api = {
        connectDevice : function(deviceData) {

            GA('connect_device:enter_snappea:'+ deviceData.model);
            
            if (!deviceData.ip) {
                GA('connection:user_category:3G');
            }

            totalRetryConnectNum += 1;

            wdDevice.lightDeviceScreen(deviceData.id);
            
            var defer = $q.defer();
            var authCode = deviceData.authcode;
            var ip = deviceData.ip;
            wdDev.setServer(ip);
            
            var pattern;
            if (!ip) {
                pattern = 'remote_3G';
            } else if (wdDev.getRequestWithRemote()) {
                pattern = 'remote_wifi';
            } else {
                pattern = 'direct';
            }

            var timeout = 3000;
            var startTime = (new Date()).getTime();
            $http({
                method: 'get',
                url: '/directive/auth',
                timeout: timeout,
                params: {
                    authcode: authCode,
                    'client_time': (new Date()).getTime(),
                    'client_name': 'Browser',
                    'client_type': 3
                }
            }).success(function(response) {
                wdDevice.setDevice(deviceData);
                wdDev.setMetaData(response);

                GA('connect_device:connect:success');
                GA('connection:' + pattern + ':success');
                GA('connection:connection_retry_' + totalRetryConnectNum + '_connect_' + pattern + ':success');

                totalRetryConnectNum = 0;
                defer.resolve();
            }).error(function(reason, status, headers, config) {
                var action = getHttpErrorReason(timeout, status, startTime);
                GA('connection:' + pattern + ':fail_' + action);
                GA('connection:' + pattern + '_fail_model:fail_' + deviceData.model);
                GA('connection:' + pattern + '_fail_sdk:fail_' + deviceData.attributes.sdk_version);
                GA('connection:' + pattern + '_fail_rom:fail_' + deviceData.attributes.rom);
                GA('connection:connection_retry_' + totalRetryConnectNum + '_connect_' + pattern + ':failed');

                defer.reject();
            });
            return defer.promise;            
        },

        connectDeviceWithRetry: function(deviceData, times) {
            var timestamp = Date.now();
            if (arguments.length === 1) {
                times = 3;
            }

            if (times === 0) {
                return $q.reject();
            }

            return api.connectDevice(deviceData).then(
                function() {
                    wdDev.setRequestWithRemote(false);
                }, function() {
                    var time;
                    var nowTimestamp = Date.now();
                    if ((wdDev.isRemoteConnection() || wdDev.getRequestWithRemote()) && (nowTimestamp - timestamp) < TIME_SPAN) {
                        time = TIME_SPAN - nowTimestamp + timestamp;
                    } else {
                        time = 0;
                    }

                    $timeout(function() {
                        return api.connectDeviceWithRetry(deviceData, times - 1);
                    }, time);
                });
        },

        // wakeup server for remote connection
        wakeupServer: function(deviceData) {
            var timeout = 4000;
            var startTime = Date.now();            
            return $http({
                method: 'get',
                url: wdDev.getWakeUpUrl() + '?did=' + deviceData.id,
                timeout: timeout
            })
            .then(function(resp) {
                var response = resp.data;
                response.wap = deviceData.ip ? false : true;
                response.networkType = deviceData.networkType;
                response.limitSize = 5 * 1024 * 1024;

                GA('connection:server_wake_up:success');
                return response;
            }, function(resp) {
                var action = getHttpErrorReason(timeout, resp.status, startTime);
                var pattern = deviceData.ip ? 'wifi' : '3G';
                GA('connection:server_wake_up:fail_' + pattern + '_' + action);
            });

        },

        wakeupServerWithRetry: function(deviceData, times) {
            if (arguments.length === 1) {
                times = 3;
            }
            if (times === 0) { 
                return $q.reject(); 
            }
            return api.wakeupServer(deviceData).then(function(data) {
                wdDev.setRequestWithRemote(data);
                return data;
            }, function() {
                return api.wakeupServerWithRetry(deviceData, times - 1);
            });

        },

        handleRemoteConnection: function(device) {
            var pattern = device.ip ? 'wifi' : '3g';
            var status = 'server';
            var serverData;

            return api.wakeupServerWithRetry(device)
                    .then(function(data) {
                        serverData = data;
                        status = 'connect';
                        return api.connectDeviceWithRetry(device);
                    })
                    .then(function() {
                        wdDev.setRemoteConnectionData(serverData);
                        wdSocket.close();
                        status = 'socket';
                        return wdSocket.connect();
                    })
                    .then(function() {
                        $rootScope.$broadcast('connection:changed');
                        GA('connection:socket_retry_connect:success_' + pattern);
                    })
                    .catch(function() {
                        var reason = 'connection:socket_retry_connect:failed_' + status + '_' + pattern;
                        GA(reason);
                        return $q.reject();
                    });
        },

        refreshDeviceAndConnect: function() {
            GA('connection:request_category:socket');

            return wdDevice.getDeviceList().then(function(list) {
                var device = wdDevice.getDevice();

                var currentOnlineDevice = _.find(list, function(item) {
                    return device && (item.id === device.id);
                });

                if (currentOnlineDevice) {
                    if (!currentOnlineDevice.ip) {
                        return api.handleRemoteConnection(currentOnlineDevice);
                    } else {
                        wdDevice.lightDeviceScreen(device.id)
                        .finally(function() {
                            wdDev.closeRemoteConnection();
                            var promise = api.connectDeviceWithRetry(currentOnlineDevice);
                            promise.then(function() {
                                wdSocket.close();
                                return wdSocket.connect();         
                            }).then(function() {
                                $rootScope.$broadcast('connection:changed');
                                GA('connection:socket_retry_connect:success_direct');
                            });
                            promise.catch(function() {
                                return api.handleRemoteConnection(currentOnlineDevice);
                            });

                            return promise;
                        });
                    }

                } else {
                    return $q.reject(); 
                }
            });
        }
    };

    return api;
}];
});
