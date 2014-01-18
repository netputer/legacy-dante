define([], function() {
'use strict';
return ['GA', 'wdDevice', '$q', '$http', 'wdDev', '$timeout',
function(GA,   wdDevice,   $q,   $http,   wdDev,   $timeout) {
    var TIME_SPAN = 3000;
    var wakeUpTimes;
    var connectDeviceTimes;
    function resetMaxWakeupTrytimes(times) {
        wakeUpTimes = times || 3;
    }
    resetMaxWakeupTrytimes();

    function resetMaxconnectTrytimes(times) {
        connectDeviceTimes = times || 4;
    }
    resetMaxconnectTrytimes();
    // 记录成功之前一共 retry 过多少次，成功了再次清零
    var totalRetryConnectNum = 0;
    // 返回 http 错误的原因
    function getHttpErrorReason(timeout, httpStatus, startTime) {
        var action;
        var duration = Date.now() - startTime;
        if (httpStatus === 0) {
            action = (Math.round(duration / 1000) * 1000 < timeout) ? ('unreached:' + duration) : 'timeout';
        } else if (httpStatus === 401) {
            action = 'reject:' + duration;
        } else {
            action = 'unknown_' + status + ':' + duration;
        }
        return action;
    }

    var api = {

        // 通过同一局域网连接
        connectDevice : function(deviceData) {

            GA('connect_device:enter_snappea:'+ deviceData.model);
            
            // 区分用户类别
            if (!deviceData.ip) {
                GA('connection:user_category:3G');
            } else if (wdDev.getRequestWithRemote()) {
                GA('connection:user_category:wifi');
            } else {
                GA('connection:user_category:direct');
            }

            // 远程唤醒一下设备
            wdDevice.lightDeviceScreen(deviceData.id);
            
            var defer = $q.defer();
            var authCode = deviceData.authcode;
            var ip = deviceData.ip;
            wdDev.setServer(ip);
            
            // 下面方法统计是否超时会用到
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
                // 自定义的，默认底层做错误控制，但是可以被调用方禁止，这样有些不合规则或遗留的api可以在应用层自己处理错误。
                // disableErrorControl: !$scope.autoAuth
            }).success(function(response) {
                wdDevice.setDevice(deviceData);
                wdDev.setMetaData(response);

                GA('connect_device:connect:success');
                
                if (!deviceData.ip) {
                    GA('connection:3G:success');
                    if (totalRetryConnectNum) {
                        GA('connection:connection_retry_connect_3g' + totalRetryConnectNum + ':success');
                    }
                } else if (wdDev.getRequestWithRemote()) {
                    GA('connection:wifi:success');
                    if (totalRetryConnectNum) {
                        GA('connection:connection_retry_connect_wifi' + totalRetryConnectNum + ':success');
                    }
                } else {
                    GA('connection:direct:success');
                    if (totalRetryConnectNum) {
                        GA('connection:connection_retry_connect_direct' + totalRetryConnectNum + ':success');
                    }
                }
                totalRetryConnectNum = 0;

                defer.resolve();
            }).error(function(reason, status, headers, config) {
                var action = getHttpErrorReason(timeout, status, startTime);

                // 区分用户类别
                if (!deviceData.ip) {
                    GA('connection:3G:fail_' + action);
                    GA('connection:3G:fail_' + deviceData.model);
                    GA('connection:3G:fail_' + deviceData.attributes.sdk_version);
                    GA('connection:3G:fail_' + deviceData.attributes.rom);
                    if (totalRetryConnectNum) {
                        GA('connection:connection_retry_connect_3g' + totalRetryConnectNum + ':failed');
                    }
                } else if (deviceData.ip && wdDev.getRequestWithRemote()) {
                    GA('connection:wifi:fail_' + action);
                    GA('connection:wifi:fail_' + deviceData.model);
                    GA('connection:wifi:fail_' + deviceData.attributes.sdk_version);
                    GA('connection:wifi:fail_' + deviceData.attributes.rom);
                    if (totalRetryConnectNum) {
                        GA('connection:connection_retry_connect_wifi' + totalRetryConnectNum + ':failed');
                    }
                } else {
                    GA('connection:direct:fail_' + action);
                    GA('connection:direct:fail_' + deviceData.model);
                    GA('connection:direct:fail_' + deviceData.attributes.sdk_version);
                    GA('connection:direct:fail_' + deviceData.attributes.rom);
                    if (totalRetryConnectNum) {
                        GA('connection:connection_retry_connect_direct' + totalRetryConnectNum + ':failed');
                    }
                }
                totalRetryConnectNum += 1;

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
                        defer.reject();
                    }
                });
            };

            tick();
            return defer.promise;
        },

        // 远程唤醒服务器，准备 wifi 中转或 3G 连接
        remoteConnect: function(deviceData) {
            var defer = $q.defer();
 
            // 下面方法统计是否超时会用到
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

        remoteConnectWithRetry: function(deviceData, times) {
            resetMaxWakeupTrytimes(times);
            var defer = $q.defer();

            var tick = function() {
                wakeUpTimes -= 1;
                api.remoteConnect(deviceData).then(function(data) {
                    defer.resolve(data);
                }, function(){
                    if (wakeUpTimes > 0) {
                        tick();
                    } else {
                        defer.reject();
                    } 
                });
            };
            tick();
            return defer.promise;
        }
    };

    return api;
}];
});
