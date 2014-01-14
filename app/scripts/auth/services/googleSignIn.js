define( [
  'jquery'
], function(
  $
) {
    'use strict';

return ['$rootScope', '$log', '$window', 'GA', '$timeout', 'wdDevice', 'wdCommunicateSnappeaCom', '$location',
function($rootScope, $log, $window, GA, $timeout, wdDevice, wdCommunicateSnappeaCom, $location) {
    
    var global = {
        profileInfo: {},

        //标记是否要强制显示设备列表，比如只有一个设备的时候，不自动进入。主要给url从/devices进入时使用。
        forceShowDevices : false,

        //标记是否本次登陆了，用于检测是否是跳转过来的用户
        hasAccessdDevice : false,

        loopTimer : null,

        devicesList: [],

        // 与服务器通信接口
        signInUrl: 'https://push.snappea.com/web/oauth2/google/login?callback=' + encodeURIComponent('http://' + $location.host() + ':' + $location.port() + '/signin-and-close.html'),
        getDevicesUrl: 'https://push.snappea.com/apppush/limbo',
        getProfileUrl: 'http://push.snappea.com/v4/api/profile',
        signOutUrl: 'http://push.snappea.com/v4/api/logout'
    };
    
    var result = {
        signInUrl: global.signInUrl,

        // 判断是否已经登录
        checkSignIn: function() {
            var defer = $.Deferred();
            var me = this;
            this.getDevices(true).then(function(){
                me.setSignIn();
                defer.resolve();
            }, function() {
                defer.reject();
            });
            return defer.promise();
        },

        // 当用户 sign out 的时候应该清理的数据
        removeAccountInfo: function() {
            global.profileInfo = {};
            global.accountNum = 0;
            global.hasAccessdDevice = false;
            wdDevice.clearDevice();
            this.removeSignInFlag();
        },

        getDevices: function(isCheckSignIn) {
            $log.log('Connecting for getting devices...');
            GA('check_sign_in:get_devices_all:all');
            var defer = $.Deferred();
            var me = this;
            $.ajax({
                type: 'GET',
                url: global.getDevicesUrl,
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
                        if (!item.ip) {
                            switch(item.attributes.network_type) {
                                case 'LTE':
                                case 'CDMA - eHRPD':
                                    item.networkType = '4G';
                                    break;
                                case 'CDMA':
                                    item.networkType = '2G';
                                    break;
                                case 'GPRS':
                                    item.networkType = 'GPRS';
                                    break;
                                case 'EDGE':
                                    item.networkType = 'EDGE';
                                    break;
                                default: item.networkType = '3G';
                            }
                        }
                    });
                    
                    global.devicesList.splice(0, global.devicesList.length);
                    Array.prototype.push.apply(global.devicesList, list);

                    //标记下是否是老用户，该功能暂时有客户端记录，之后会由服务器端提供接口。老用户定义：该用户成功获取设备，并且设备列表中有设备。
                    if ( list.length > 0 && !me.isOldUser() ) {
                        me.setOldUser();
                    }
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

        loopGetDevices : function() {
            var me = this;
            if (!global.loopTimer) {
                global.loopTimer = $window.setInterval(function() {
                    me.getDevices().then(function(list) {
                        global.devicesList.splice(0, global.devicesList.length);
                        Array.prototype.push.apply(global.devicesList, list);
                    }, function(xhr) {
                        GA('check_sign_in:get_devices_failed:xhrError_' + xhr.status + '_loopDevicesFailed');
                    });
                }, 5000);
            }

            //因为给出去的是一个数组，在 Javascript 中传递的是指针，通过外层 $scope.$watch 函数可以监测其变化。
            return global.devicesList;
        },

        stopLoopGetDevices : function() {
            $window.clearInterval(global.loopTimer);
            global.loopTimer = null;
        },

        getProfile: function() {
            GA('check_sign_in:get_profile_all:all');
            var defer = $.Deferred();
            var me = this;

            // 如果本次已经获取的数据，则直接从本地读取
            if (global.profileInfo.uid) {
                $timeout(function() {
                    defer.resolve(global.profileInfo);
                }, 0);
            } else {
                $.ajax({
                    type: 'GET',
                    url: global.getProfileUrl,
                    async: false,
                    contentType: 'application/json',
                    dataType: 'jsonp',
                    timeout: 10000
                }).done(function(data) {
                    GA('check_sign_in:get_profile:success');
                    $rootScope.$apply(function() {
                        global.profileInfo = data.member;
                        defer.resolve(data.member);
                    });
                }).fail(function(xhr, status, error) {
                    GA('check_sign_in:get_profile:failed');
                    $rootScope.$apply(function() {
                        defer.reject();
                    });
                });
            }
            return defer.promise();
        },

        signout : function() {
            $log.log('Sign out...');
            GA('check_sign_in:sign_out_all:all');
            wdCommunicateSnappeaCom.googleSignOut();
            var defer = $.Deferred();
            var me = this;
            $.ajax({
                type: 'GET',
                url: global.signOutUrl,
                async: false,
                contentType: 'application/json',
                dataType: 'jsonp',
                timeout: 10000
            }).done(function(data) {
                GA('check_sign_in:sign_out:success');
                $rootScope.$apply(function() {
                    wdDevice.signout();
                    me.removeAccountInfo();
                    $log.log('Sign out success!');
                    defer.resolve('signout');
                });
            }).fail(function(xhr, status, error) {
                GA('check_sign_in:sign_out:failed');
                $log.error('google signout failed.');
                $rootScope.$apply(function() {
                    defer.reject();
                });
            });
            return defer.promise();
        },

        // 客户端记录是一个老用户
        setOldUser: function() {
            this.setStorageItem('oldUserFlag', true);
        },
        isOldUser: function() {
            return !!this.getStorageItem('oldUserFlag');
        },

        // 是否本次登录到设备中，用于检测是否是跳转过来的设备
        setHasAccessdDevice: function() {
            global.hasAccessdDevice = true;
        },
        getHasAccessdDevice: function() {
            return global.hasAccessdDevice;
        },

        // 是否曾经登录过，用于进入展示 loading 
        setSignIn: function() {
            this.setStorageItem('signInFlag', true);
        },
        isSignIn: function() {
            return !!this.getStorageItem('signInFlag');
        },
        removeSignInFlag: function() {
            this.removeStorageItem('signInFlag');
        },

        setForceShowDevices: function(flag) {
            global.forceShowDevices = flag;
        },
        getForceShowDevices: function() {
            return global.forceShowDevices;
        },

        // 操作存储的方法
        removeStorageItem: function(name) {
            $window.localStorage.removeItem(name);
        },
        setStorageItem: function(name, data) {
            $window.localStorage.setItem(name, data);
        },
        getStorageItem: function(name) {
            return $window.localStorage.getItem(name);
        }
    };

  return result;
}];
});
