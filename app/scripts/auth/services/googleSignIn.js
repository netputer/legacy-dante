define( [
  'jquery'
], function(
  $
) {
    'use strict';

return [ '$http','$q','$rootScope', '$log', '$window', 'GA', '$timeout', function ( $http, $q, $rootScope, $log, $window, GA, $timeout ) {

    var global = {
        authResult : {},
        account : '',
        currentDevice : {},

        //标记是否要强制显示设备列表，比如只有一个设备的时候，不自动进入。主要给url从/devices进入时使用。
        forceShowDevices : false,

        //标记是否本次登陆了，用于检测是否是跳转过来的用户
        hasAccessdDevice : false
    };

    var result = {

        //取得或者设置authResult
        authResult : function (data) {
            var me = this;
            if(!!data) {
                me.setStorageItem('googleToken', data['access_token']);
                global.authResult = data;
            }else{
                if(!global.authResult['access_token']){
                    global.authResult['access_token'] = me.getStorageItem('googleToken');
                }
                return global.authResult;
            }
        },

        //取得或者设置currentDevice
        currentDevice : function (data) {
            var me = this;
            if(!data){
                return global.currentDevice;
            }else{
                global.currentDevice = data;
                me.setStorageItem('currentDevice', JSON.stringify(data));
            }
        },

        //刷新Google token
        refreshToken : function ( immediate ) {
            GA('check_sign_in:refresh_token:all');
            $log.log('Refreshing google tokening...');
            var defer = $q.defer();
            if(typeof immediate === 'undefined') {
                immediate = false;
            }else{
                immediate = true;
            }
            var me = this;
            
            //immediate - 类型：布尔值。如果为 true，则登录会使用“即时模式”，也就是在后台刷新令牌，不向用户显示用户界面。
            $window.gapi.auth.authorize({
               'client_id':'592459906195-7sjc6v1cg6kf46vdhdvn8g2pvjbdn5ae.apps.googleusercontent.com',
               'immediate':immediate,
               'scope':'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email'
            },function(authResult){
                $rootScope.$apply(function() {
                    if (authResult && authResult['access_token']) {
                        GA('check_sign_in:refresh_token:success');
                        me.authResult(authResult);
                        $log.log('Getting google account informations...');
                        me.getAccount().then(function(data){
                            $log.log('All google login process have successed!');
                            defer.resolve(data);
                        },function( data ){
                            $log.error('Get account failed!');
                            defer.resolve( data );
                        });
                    } else if (!authResult || authResult['error']) {
                        $log.error('Google refresh error!');
                        GA('check_sign_in:refresh_token:fail');
                        defer.reject();
                    }
                });
            });
            return defer.promise;
        },

        getAccount : function () {
            var defer = $q.defer();
            var gapi = $window.gapi;
            if(!global.account){
                var authResult = global.authResult;
                // isTimeout 用来标识是否超时（ 这个API没有超时处理，只能手作了）， 0 未处理，1没有超时，-1超时。
                var isTimeout = 0;
                gapi.client.load('oauth2', 'v2', function() {
                    var request = gapi.client.oauth2.userinfo.get();
                    request.execute(function(obj){
                        if( isTimeout === 0 ) {
                            isTimeout = 1;
                            global.account = obj['email'];
                            defer.resolve(global.account);
                            $rootScope.$apply();
                        }
                    });
                });
                //超时处理
                $timeout(function() {
                    if(isTimeout === 0) {
                        isTimeout = -1;
                        defer.reject();
                    }
                },10000);
            }else{
                defer.resolve(global.account);
            }
            return defer.promise;
        },

        getDevices : function () {
            $log.log('Connecting for getting devices...');
            GA('check_sign_in:get_devices:all');
            // Successfully authorized
            var authResult = this.authResult();
            var defer = $q.defer();
            var me = this;

            //调用服务器端接口
            var url = 'https://push.snappea.com/apppush/limbo?google_token=' + encodeURIComponent(authResult['access_token']);

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
                    defer.resolve(data);
                });                    
            }).fail(function(e, status ) {
                GA('check_sign_in:get_devices:failed_'+ status );
                $rootScope.$apply(function() {
                    $log.error('Getting devices failed');
                    defer.reject();
                });
            });
            return defer.promise;
        },

        signOut : function () {
            var defer = $q.defer();
            this.currentDevice({});
            this.removeStorageItem('googleToken');
            var revokeUrl = 'https://accounts.google.com/o/oauth2/revoke?token=' + global.authResult.access_token;
            $.ajax({
                type: 'GET',
                url: revokeUrl,
                async: false,
                contentType: 'application/json',
                dataType: 'jsonp',
                success: function(nullResponse) {
                    // 客户取消了关联，据此执行相应操作
                    // 回应始终为未定义。
                    global.authResult = {};
                    defer.resolve('signOut');
                    $rootScope.$apply();
                },
                error: function(e) {
                  // 处理错误
                  // console.log(e);
                  // 如果失败，您可以引导用户手动取消关联
                  // https://plus.google.com/apps
                }
            });
            return defer.promise;
        },

        //是否本次登陆过，用于检测是否是跳转过来的设备
        getHasAccessdDevice : function () {
            return global.hasAccessdDevice;
        },
        setHasAccessdDevice : function () {
            global.hasAccessdDevice = true;
        },
        setForceShowDevices : function ( flag ) {
            global.forceShowDevices = flag;
        },

        getForceShowDevices : function () {
            return global.forceShowDevices;
        },

        removeStorageItem : function ( name ) {
            $window.localStorage.removeItem( name );
        },

        setStorageItem : function ( name , data ) {
            $window.localStorage.setItem( name , data );
        },

        getStorageItem : function ( name ) {
            return $window.localStorage.getItem( name );
        }
    };

  return result;
}];
});
