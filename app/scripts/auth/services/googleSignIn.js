define( [
  'jquery'
], function(
  $
) {
    'use strict';

return ['$q','$rootScope', '$log', '$window', 'GA', '$timeout', 'wdDevice', 'wdCommunicateSnappeaCom', 'wdGoogleMultipleHack', 
function ($q, $rootScope, $log, $window, GA, $timeout, wdDevice, wdCommunicateSnappeaCom, wdGoogleMultipleHack) {
    
    // 检测的最多账号数
    var MAX_ACCOUNT_NUM = 5;
    var global = {
        authResult : {},
        profileInfo: {},

        //标记是否要强制显示设备列表，比如只有一个设备的时候，不自动进入。主要给url从/devices进入时使用。
        forceShowDevices : false,

        //标记是否本次登陆了，用于检测是否是跳转过来的用户
        hasAccessdDevice : false,

        //当前账号号码
        accountNum: 0,

        devicesList: [],

        loopTimer : null,

        // 用来标记是否正在刷新 token ，来确保同时只有一个刷新 token 的请求。
        refreshTokenDefer : null,

        // 用来标记是否正在 checkToken ，来确保同时只有一个 check token 的请求。
        checkTokenDefer : null
    };

    var result = {

        //取得或者设置authResult
        authResult : function (data) {
            var me = this;
            if (!!data) {
                me.setStorageItem('googleToken', data.access_token);
                global.authResult = data;
            } else {
                if (!global.authResult.access_token){
                    global.authResult.access_token = me.getStorageItem('googleToken');
                }
                return global.authResult;
            }
        },

        checkToken : function () {
            if (global.checkTokenDefer) {
                return global.checkTokenDefer.promise;
            } else {
                global.checkTokenDefer = $q.defer();
            }

            var me = this;
            wdGoogleMultipleHack.checkToken().then(function() {
                me.getProfileInfo().then(function(data) {
                    global.checkTokenDefer.resolve();
                    global.checkTokenDefer = null;
                }, function() {
                    error();
                });
            }, function() {
                error();
            });

            function error() {
                me.refreshToken(true).then(function() {
                    global.checkTokenDefer.resolve();
                    global.checkTokenDefer = null;
                }, function() {
                    global.checkTokenDefer.reject();
                    global.checkTokenDefer = null;
                }); 
            }
            return global.checkTokenDefer.promise;
        },

        //刷新Google token
        refreshToken : function ( immediate ) {
            $log.log('Refreshing google tokening...');

            if (global.refreshTokenDefer) {
                return global.refreshTokenDefer.promise;
            } else {
                global.refreshTokenDefer = $q.defer();
            }

            if (immediate) {
                immediate = true;
                GA('check_sign_in:refresh_token_all:all');
            } else {
                immediate = false;
            }

            var me = this;
            var timeout = 10000;
            var timer;
            if (immediate) {
                timer = $timeout(function() {
                    $log.error('Refreshing google token timeout.');
                    global.refreshTokenDefer.reject();
                    global.refreshTokenDefer = null;
                }, timeout);
            }

            //内部递归调用的方法
            function refresh() {
                //immediate - 类型：布尔值。如果为 true，则登录会使用“即时模式”，也就是在后台刷新令牌，不向用户显示用户界面。
                $window.gapi.auth.authorize({
                    'client_id':'592459906195-7sjc6v1cg6kf46vdhdvn8g2pvjbdn5ae.apps.googleusercontent.com',
                    'immediate':immediate,
                    'authuser': global.accountNum,
                    'scope':'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email',
                    'cookiepolicy' : 'single_host_origin',
                    'apppackagename' : 'com.snappea'
                },function(authResult){
                    $rootScope.$apply(function() {
                        if (authResult && authResult.access_token) {
                            if (!immediate) {
                                GA('check_sign_in:refresh_token:success');
                            } else {
                                $timeout.cancel(timer);
                            }
                            me.authResult(authResult);
                            wdCommunicateSnappeaCom.googleSignIn();
                            me.getProfileInfo().then(function(data) {
                                $log.log('All google login process have successed!');
                                global.refreshTokenDefer.resolve();
                                global.refreshTokenDefer = null;
                            }, function() {
                                $log.error('Get profile failed!');
                                global.refreshTokenDefer.reject();
                                global.refreshTokenDefer = null;
                            });
                        } else if (authResult === null) {
                            if (global.accountNum >= MAX_ACCOUNT_NUM) {
                                // 在 Google 把账号都退出了
                                if (immediate) {
                                    $timeout.cancel(timer);
                                }
                                global.accountNum = 0;
                                $log.error('User maybe sigout all accounts!');
                                global.refreshTokenDefer.reject();
                                global.refreshTokenDefer = null;
                            } else {
                                // 账号的号码不对
                                global.accountNum += 1;
                                refresh();
                            }
                        } else if (authResult.error) {
                            $log.error('Google refresh error!');
                            if (!immediate) {
                                GA('check_sign_in:refresh_token:fail');
                            } else {
                                $timeout.cancel(timer);
                            }
                            global.refreshTokenDefer.reject();
                            global.refreshTokenDefer = null;
                        }
                    });
                });                
            }

            $window.googleSignInOnloadDefer.done(function() {
                refresh();
            });

            return global.refreshTokenDefer.promise;
        },

        getProfileInfo: function() {
            var defer = $q.defer();
            var gapi = $window.gapi;
            var me = this;

            if (!global.profileInfo.id) {

                // 这里是为了兼容 Google 目前不支持多账号的问题，所以增加的将用户数据存在本地的逻辑
                var localData = wdGoogleMultipleHack.getLocalProfile();
                if (localData) {
                    defer.resolve(localData);
                    return defer.promise;
                }

                var isTimeout;
                $window.googleSignInOnloadDefer.done(function() {
                    $window.gapi.client.load('plus','v1', function() {
                        var request = $window.gapi.client.plus.people.get({
                           'userId': 'me'
                        });

                        request.execute(function(obj) {
                            if (isTimeout !== true) {
                                isTimeout = false;

                                $rootScope.$apply(function() {
                                    global.profileInfo = obj;
                                    wdGoogleMultipleHack.setLocalProfile(obj);
                                    defer.resolve(global.profileInfo);
                                });
                            }
                        });
                    });
                });

                $timeout(function() {
                    if (isTimeout !== false) {
                        isTimeout = true;
                        defer.reject();
                    }

                // 这个时间总是失败，居然总是达到超时时间，没办法才改成了 20s .
                }, 20000);
            } else {
                defer.resolve(global.profileInfo);
            }

            return defer.promise;
        },

        removeAccountInfo: function() {
            global.profileInfo = {};
            global.authResult = {};
            global.accountNum = 0;
            global.hasAccessdDevice = false;
            this.removeStorageItem('googleToken');
            this.removeStorageItem('user-profile');
        },

        getDevices : function () {
            $log.log('Connecting for getting devices...');
            GA('check_sign_in:get_devices_all:all');
            // Successfully authorized
            var authResult = this.authResult();
            var defer = $q.defer();
            var me = this;

            //调用服务器端接口
            var url = 'https://push.snappea.com/apppush/limbo?google_token=' + encodeURIComponent(authResult.access_token);

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
                    defer.reject();
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
            $log.log('Sign out from google ...');
            wdCommunicateSnappeaCom.googleSignOut();
            $window.gapi.auth.signOut();
            var me = this;
            var defer = $q.defer();
            wdGoogleMultipleHack.revoke().then(function() {
                // 客户取消了关联，据此执行相应操作
                // 回应始终为未定义。
                wdDevice.signout();
                me.removeAccountInfo();
                $log.log('Sign out success!');
                defer.resolve('signout');
            }, function() {
                $log.error('google signout failed.');
                defer.reject();
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
