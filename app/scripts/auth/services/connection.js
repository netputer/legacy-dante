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
                
                if (!deviceData.ip) {
                    GA('connection:3G:success');
                    if (totalRetryConnectNum) {
                        GA('connection:connection_retry_' + totalRetryConnectNum + '_connect_3g:success');
                    }
                } else if (wdDev.getRequestWithRemote()) {
                    GA('connection:user_category:wifi');
                    GA('connection:wifi:success');
                    if (totalRetryConnectNum) {
                        GA('connection:connection_retry_' + totalRetryConnectNum + '_connect_wifi:success');
                    }
                } else {
                    GA('connection:user_category:direct');
                    GA('connection:direct:success');
                    if (totalRetryConnectNum) {
                        GA('connection:connection_retry_' + totalRetryConnectNum + '_connect_direct:success');
                    }
                }
                totalRetryConnectNum = 0;

                defer.resolve();
            }).error(function(reason, status, headers, config) {
                var action = getHttpErrorReason(timeout, status, startTime);

                if (!deviceData.ip) {
                    GA('connection:3G:fail_' + action);
                    GA('connection:3G_fail_model:fail_' + deviceData.model);
                    GA('connection:3G_fail_sdk:fail_' + deviceData.attributes.sdk_version);
                    GA('connection:3G_fail_rom:fail_' + deviceData.attributes.rom);
                    if (totalRetryConnectNum) {
                        GA('connection:connection_retry_' + totalRetryConnectNum + '_connect_3g:failed');
                    }
                } else if (deviceData.ip && wdDev.getRequestWithRemote()) {
                    GA('connection:wifi:fail_' + action);
                    GA('connection:wifi_fail_model:fail_' + deviceData.model);
                    GA('connection:wifi_fail_sdk:fail_' + deviceData.attributes.sdk_version);
                    GA('connection:wifi_fail_rom:fail_' + deviceData.attributes.rom);
                    if (totalRetryConnectNum) {
                        GA('connection:connection_retry_' + totalRetryConnectNum + '_connect_wifi:failed');
                    }
                } else {
                    GA('connection:direct:fail_' + action);
                    GA('connection:direct_fail_model:fail_' + deviceData.model);
                    GA('connection:direct_fail_sdk:fail_' + deviceData.attributes.sdk_version);
                    GA('connection:direct_fail_rom:fail_' + deviceData.attributes.rom);
                    if (totalRetryConnectNum) {
                        GA('connection:connection_retry_' + totalRetryConnectNum + '_connect_direct:failed');
                    }
                }

                defer.reject();
            });
            return defer.promise;            
        },

        connectDeviceWithRetry: function(deviceData, times) {
            resetMaxconnectTrytimes(times);
            var defer = $q.defer();

            var tick = function() {
                var timestamp = new Date().getTime();
                connectDeviceTimes -= 1;
                api.connectDevice(deviceData).then(function() {
                    wdDev.setRequestWithRemote(false);
                    defer.resolve();
                }, function() {
                    if (connectDeviceTimes > 0) {
                        var nowTimestamp = new Date().getTime();
                        if ((wdDev.isRemoteConnection() || wdDev.getRequestWithRemote()) && (nowTimestamp - timestamp) < TIME_SPAN) {
                            $timeout(function() {
                                tick();
                            }, TIME_SPAN - nowTimestamp + timestamp);
                        } else {
                            tick();
                        }
                        
                    } else {
                        wdDev.setRequestWithRemote(false);
                        defer.reject();
                    }
                });
            };

            tick();
            return defer.promise;
        },

        // wakeup server for remote connection
        wakeupServer: function(deviceData) {
            var defer = $q.defer();
 
            var timeout = 4000;
            var startTime = (new Date()).getTime();            
            $http({
                method: 'get',
                url: wdDev.getWakeUpUrl() + '?did=' + deviceData.id,
                timeout: timeout
            })
            .success(function(response) {
                response.wap = deviceData.ip ? false : true;
                response.networkType = deviceData.networkType;
                response.limitSize = 5 * 1024 * 1024;

                GA('connection:server_wake_up:success');
                defer.resolve(response);
            })
            .error(function(reason, status, headers) {
                var action = getHttpErrorReason(timeout, status, startTime);

                if (deviceData.ip) {
                    GA('connection:server_wake_up:fail_3G_' + action);
                } else {
                    GA('connection:server_wake_up:fail_wifi_' + action);
                }
                defer.reject();
            });

            return defer.promise;
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
            var patten = device.ip ? 'wifi' : '3g';
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
                        GA('connection:socket_retry_connect:success_' + patten);
                    })
                    .catch(function() {
                        var reason = 'connection:socket_retry_connect:failed_' + status + '_' + patten;
                        GA(reason);
                        return $q.reject();
                    });
        },

        refreshDeviceAndConnect: function() {
            GA('connection:request_category:socket');

            return wdDevice.getDeviceList()
                .then(function(list) {
                    var device = wdDevice.getDevice();

                    var currentOnlineDevice = _.find(list, function(item) {
                        return device && (item.id === device.id);
                    });

                    if (currentOnlineDevice) {
                        if (currentOnlineDevice.ip) {
                            return api.handleRemoteConnection(currentOnlineDevice);
                        } else {
                            wdDevice.lightDeviceScreen(device.id);
                            wdDev.closeRemoteConnection();

                            return api.connectDeviceWithRetry(currentOnlineDevice)
                                    .then(function() {
                                        wdSocket.close();
                                        return wdSocket.connect()
                                                .then(function() {
                                                    $rootScope.$broadcast('connection:changed');
                                                    GA('connection:socket_retry_connect:success_direct');
                                                });
                                    }, function() {
                                        return api.handleRemoteConnection(currentOnlineDevice);
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
