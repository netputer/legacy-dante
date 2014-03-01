define([
    'jquery'
], function(
    $
) {
'use strict';
return function() {
    var self = this;
    var loopGetDeviceListTimer = null;

    self.$get = ['$window', '$location', 'wdDev', '$rootScope', '$log', 'GA', '$injector',
        function($window,    $location,   wdDev,   $rootScope,   $log,   GA,   $injector) {
        var valid = false;
        var api = {
            valid: function() {
                return valid;
            },
            getDevice: function() {
                var data;
                try {
                    data = JSON.parse($window.localStorage.getItem('currentDevice'));
                }
                catch (e) {
                    data = null;
                }
                return data;
            },
            setDevice: function(data) {
                $window.localStorage.setItem('currentDevice', JSON.stringify(data) );
                valid = true;
            },
            clearDevice: function() {
                $window.localStorage.removeItem('currentDevice');
                valid = false;
            },
            
            //signout current device to device list
            signout: function() {
                this.setDevice({status:'devices'});
                if (wdDev.query('ac')) {
                    $window.location = $window.location.pathname + '#/portal';
                } else {
                    $location.url('/portal');
                }
                $rootScope.$broadcast('signout');
            },

            lightDeviceScreen: function(deviceId) {
                var url = 'https://push.snappea.com/accept?data=wake_up';
                $.ajax({
                    type: 'GET',
                    url: url,
                    dataType: 'jsonp',
                    data: {
                        did: deviceId
                    }
                });
            },
            getDeviceList: function(isCheckSignIn) {
                $log.log('Connecting for getting devices...');
                var defer = $.Deferred();
                var me = this;
                $.ajax({
                    type: 'GET',
                    url: 'https://push.snappea.com/apppush/limbo',
                    async: false,
                    contentType: 'application/json',
                    dataType: 'jsonp',
                    timeout: 10000
                }).done(function(list) {
                    if (!isCheckSignIn) {
                        GA('check_sign_in:get_devices:success');
                        $log.log('Getting devices success!', list);
                    }
                    $rootScope.$apply(function() {
                        list.forEach(function(item) {
                            switch(item.attributes.network_type) {
                                case 'LTE':
                                case 'CDMA - eHRPD':
                                    item.networkType = '4g';
                                    break;
                                case 'CDMA':
                                    item.networkType = '2g';
                                    break;
                                case 'GPRS':
                                    item.networkType = 'gprs';
                                    break;
                                case 'EDGE':
                                    item.networkType = 'edge';
                                    break;
                                case 'WIFI':
                                    item.networkType = 'wifi';
                                    break;
                                default: item.networkType = '3g';
                            }
                        });
                        
                        //标记下是否是老用户，该功能暂时有客户端记录，之后会由服务器端提供接口。老用户定义：该用户成功获取设备，并且设备列表中有设备。
                        $injector.invoke(['internationalAccount', function(internationalAccount) {
                            if ( list.length > 0 && !internationalAccount.isOldUser() ) {
                                internationalAccount.setOldUser();
                            }
                        }]);
                        
                        defer.resolve(list);
                    });
                }).fail(function(xhr, status, error) {
                    if (!isCheckSignIn) {
                        GA('check_sign_in:get_devices:failed_'+ xhr.status );
                        $log.error('Getting devices failed');
                    }
                    $rootScope.$apply(function() {
                        defer.reject(xhr);
                    });
                });
                return defer.promise();
            },

            loopGetDeviceList : function() {
                var defer = $.Deferred();

                api.stopLoopGetDeviceList();
                loopGetDeviceListTimer = $window.setInterval(function() {
                    api.getDeviceList().then(function(list) {
                        defer.resolve(list);
                    });
                }, 5000);

                return defer.promise();
            },

            stopLoopGetDeviceList : function() {
                if (loopGetDeviceListTimer) {
                    $window.clearInterval(loopGetDeviceListTimer);
                }
                loopGetDeviceListTimer = null;
            }

        };

        return api;
    }];
};
});
