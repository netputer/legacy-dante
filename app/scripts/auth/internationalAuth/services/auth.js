define( [
  'jquery'
], function(
  $
) {
    'use strict';

return ['$rootScope', '$log', '$window', 'GA', '$timeout', 'wdDevice', 'wdCommunicateSnappeaCom', '$location',
function($rootScope,   $log,   $window,   GA,   $timeout,   wdDevice,   wdCommunicateSnappeaCom,   $location) {

    //标记是否要强制显示设备列表，比如只有一个设备的时候，不自动进入。主要给url从/devices进入时使用。
    var forceShowDevices = false;
    //标记是否本次登陆了，用于检测是否是跳转过来的用户
    var hasAccessdDevice = false;
    var profileInfo = {};
    var SIGN_IN_CB = encodeURIComponent('http://' + $location.host() + ':' + $location.port() + '/signin-and-close.html');
    var SIGN_IN_URL = 'https://push.snappea.com/web/oauth2/google/login?callback=' + SIGN_IN_CB;
    var GET_PROFILE_URL = 'http://push.snappea.com/v4/api/profile';
    var SIGN_OUT_URL = 'http://push.snappea.com/v4/api/logout';
    
    // 当用户 sign out 的时候应该清理的数据
    var removeAccountInfo = function() {
        profileInfo = {};
        hasAccessdDevice = false;
        wdDevice.clearDevice();
        api.removeSignInFlag();
    };

    // 操作存储的方法
    var removeStorageItem = function(name) {
        $window.localStorage.removeItem(name);
    };
    var setStorageItem = function(name, data) {
        $window.localStorage.setItem(name, data);
    };
    var getStorageItem = function(name) {
        return $window.localStorage.getItem(name);
    };

    var api = {
        signIn: function() {
             var width = 500;
            var height = 600;
            var top = 50;

            // make panel is centered horizontally
            var left = Math.round($window.screen.width - width) / 2;
            $window.open(SIGN_IN_URL, 'Limbo', 'fullscreen=no,width=' + width + ',height=' + height + ',top=' + top + ',left=' + left);          
            GA('user_sign_in:click_sign_in:google_sign_in');
        },

        // 判断是否已经登录
        checkAuthStatus: function() {
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

        getProfile: function() {
            var defer = $.Deferred();
            var me = this;

            // 如果本次已经获取的数据，则直接从本地读取
            if (profileInfo.uid) {
                $timeout(function() {
                    defer.resolve(profileInfo);
                }, 0);
            } else {
                $.ajax({
                    type: 'GET',
                    url: GET_PROFILE_URL,
                    async: false,
                    contentType: 'application/json',
                    dataType: 'jsonp',
                    timeout: 10000
                }).done(function(data) {
                    GA('check_sign_in:get_profile:success');
                    $rootScope.$apply(function() {
                        profileInfo = data.member;
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
                url: SIGN_OUT_URL,
                async: false,
                contentType: 'application/json',
                dataType: 'jsonp',
                timeout: 10000
            }).done(function(data) {
                GA('check_sign_in:sign_out:success');
                $rootScope.$apply(function() {
                    wdDevice.signOut();
                    removeAccountInfo();
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
            setStorageItem('oldUserFlag', true);
        },
        isOldUser: function() {
            return !!getStorageItem('oldUserFlag');
        },

        // 是否本次登录到设备中，用于检测是否是跳转过来的设备
        setHasAccessdDevice: function() {
            hasAccessdDevice = true;
        },
        getHasAccessdDevice: function() {
            return hasAccessdDevice;
        },

        // 是否曾经登录过，用于进入展示 loading 
        setSignIn: function() {
            wdCommunicateSnappeaCom.googleSignIn();
            setStorageItem('signInFlag', true);
        },
        isSignIn: function() {
            return !!getStorageItem('signInFlag');
        },
        removeSignInFlag: function() {
            removeStorageItem('signInFlag');
        },

        setForceShowDevices: function(flag) {
            forceShowDevices = flag;
        },
        getForceShowDevices: function() {
            return forceShowDevices;
        }
    };

  return api;
}];
});
