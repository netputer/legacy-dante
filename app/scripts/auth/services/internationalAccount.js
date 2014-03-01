define( [
  'jquery'
], function(
  $
) {
    'use strict';

return ['$rootScope', '$log', '$window', 'GA', '$timeout', 'wdDevice', 'wdCommunicateSnappeaCom', '$location',
function($rootScope,   $log,   $window,   GA,   $timeout,   wdDevice,   wdCommunicateSnappeaCom,   $location) {
    
    var global = {
        profileInfo: {},

        //标记是否要强制显示设备列表，比如只有一个设备的时候，不自动进入。主要给url从/devices进入时使用。
        forceShowDevices : false,

        //标记是否本次登陆了，用于检测是否是跳转过来的用户
        hasAccessdDevice : false,

        // 与服务器通信接口
        signInUrl: 'https://push.snappea.com/web/oauth2/google/login?callback=' + encodeURIComponent('http://' + $location.host() + ':' + $location.port() + '/signin-and-close.html'),
        getProfileUrl: 'http://push.snappea.com/v4/api/profile',
        signOutUrl: 'http://push.snappea.com/v4/api/logout'
    };
    
    var result = {
        signInUrl: global.signInUrl,

        // 判断是否已经登录
        checkSignIn: function() {
            var defer = $.Deferred();
            var me = this;
            wdDevice.getDeviceList(true).then(function(){
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

        getProfile: function() {
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
            wdCommunicateSnappeaCom.googleSignIn();
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
