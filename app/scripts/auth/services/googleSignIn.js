define( [
  'jquery'
], function(
  $
) {
    'use strict';

return ['$q','$rootScope', '$log', '$window', 'GA', '$timeout', 'wdDevice', 'wdCommunicateSnappeaCom', 'wdGoogleMultipleHack', 
function ($q, $rootScope, $log, $window, GA, $timeout, wdDevice, wdCommunicateSnappeaCom, wdGoogleMultipleHack) {
    
    var global = {
        profileInfo: {},

        //标记是否要强制显示设备列表，比如只有一个设备的时候，不自动进入。主要给url从/devices进入时使用。
        forceShowDevices : false,

        //标记是否本次登陆了，用于检测是否是跳转过来的用户
        hasAccessdDevice : false,

        loopTimer : null
    };

    var result = {

        // 当用户 sign out 的时候应该清理的数据
        removeAccountInfo: function() {
            global.profileInfo = {};
            global.accountNum = 0;
            global.hasAccessdDevice = false;
        },

        getProfile: function () {
            GA('check_sign_in:get_profile_all:all');
            var defer = $q.defer();
            var me = this;
            var url = 'http://push.snappea.com/v4/api/profile';
            $.ajax({
                type: 'GET',
                url: url,
                async: false,
                contentType: 'application/json',
                dataType: 'jsonp',
                timeout: 10000
            }).done(function( data ) {
                GA('check_sign_in:get_profile:success');
                $rootScope.$apply(function () {
                    global.profileInfo = data;
                    console.log(data);
                    defer.resolve(data);
                });
            }).fail(function( data ) {
                GA('check_sign_in:get_profile:failed');
                $rootScope.$apply(function () {
                    console.log(data);
                    defer.reject(data);
                });
            });
            return defer.promise;
        },

        getDevices: function () {
            $log.log('Connecting for getting devices...');
            GA('check_sign_in:get_devices_all:all');
            var defer = $q.defer();
            var me = this;

            //调用服务器端接口
            var url = 'https://push.snappea.com/apppush/limbo';
            $.ajax({
                type: 'GET',
                url: url,
                async: false,
                contentType: 'application/json',
                dataType: 'jsonp',
                timeout: 10000
            }).done(function( data ) {
                GA('check_sign_in:get_devices:success');
                $rootScope.$apply(function() {
                    $log.log('Getting devices success!',data);
                    var list = [];
                    data.forEach(function(v, i) {
                        if (v.ip) {
                            list.push(v);
                        }
                    });

                    //标记下是否是老用户，该功能暂时有客户端记录，之后会由服务器端提供接口。老用户定义：该用户成功获取设备，并且设备列表中有设备。
                    if ( list.length > 0 && !me.isOldUser() ) {
                        me.setOldUser();
                    }
                    defer.resolve(list);
                });
            }).fail(function( xhr ) {
                GA('check_sign_in:get_devices:failed_'+ xhr.status );
                $rootScope.$apply(function() {
                    $log.error('Getting devices failed');
                    defer.reject(xhr);
                });
            });
            return defer.promise;
        },

        loopGetDevices : function () {
            var me = this;
            if (!global.loopTimer) {
                global.loopTimer = $window.setInterval(function () {
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

        stopLoopGetDevices : function () {
            $window.clearInterval(global.loopTimer);
            global.loopTimer = null;
        },

        signout : function () {
            $log.log('Sign out...');
            GA('check_sign_in:sign_out_all:all');
            wdCommunicateSnappeaCom.googleSignOut();
            var defer = $q.defer();
            var me = this;
            var url = 'http://push.snappea.com/v4/api/logout';
            $.ajax({
                type: 'GET',
                url: url,
                async: false,
                contentType: 'application/json',
                dataType: 'jsonp',
                timeout: 10000
            }).done(function( data ) {
                GA('check_sign_in:sign_out:success');
                $rootScope.$apply(function () {
                    wdDevice.signout();
                    me.removeAccountInfo();
                    $log.log('Sign out success!');
                    defer.resolve('signout');
                });
            }).fail(function( data ) {
                GA('check_sign_in:sign_out:failed');
                $log.error('google signout failed.');
                $rootScope.$apply(function () {
                    defer.reject();
                });
            });
            return defer.promise;
       },

        // 客户端记录是一个老用户
        setOldUser: function () {
            this.setStorageItem('oldUserFlag', true);
        },
        isOldUser: function () {
            return this.getStorageItem('oldUserFlag');
        },

        //是否本次登陆过，用于检测是否是跳转过来的设备
        getHasAccessdDevice: function () {
            return global.hasAccessdDevice;
        },
        setHasAccessdDevice: function () {
            global.hasAccessdDevice = true;
        },

        setForceShowDevices: function (flag) {
            global.forceShowDevices = flag;
        },
        getForceShowDevices: function () {
            return global.forceShowDevices;
        },

        removeStorageItem: function (name) {
            $window.localStorage.removeItem(name);
        },
        setStorageItem: function (name, data) {
            $window.localStorage.setItem(name, data);
        },
        getStorageItem: function (name) {
            return $window.localStorage.getItem(name);
        }
    };

  return result;
}];
});
