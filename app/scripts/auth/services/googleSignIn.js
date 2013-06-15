define( [
  'jquery'
], function(
  $
) {
    'use strict';

return [ '$http','$q','$rootScope', '$log', function ( $http, $q, $rootScope, $log ) {

    var global = {
        authResult : {},
        defer : $q.defer(),
        account : '',
        currentDevice : {}
    };

    var result = {
        init : function(){
            return global.defer.promise;
        },

        //取得或者设置authResult
        authResult : function (data) {
          if(!!data) {
            $log.log(data);
            window.localStorage.setItem('google_token', data['access_token']);
            global.authResult = data;
          }else{
            if(!global.authResult['access_token']){
                global.authResult['access_token'] = window.localStorage.getItem('google_token');
            }
            return global.authResult;
          }
        },

        //取得或者设置currentDevice
        currentDevice : function (data) {
            if(!data){
                return global.currentDevice;
            }else{
                global.currentDevice = data;
            }
        },

        //渲染按钮(注意：需要等init中的异步脚本onload之后触发)
        render : function () {
            var eles = $('.google-btn');
            var gapi = window.gapi;
            for(var i = 0 , l = eles.length ; i < l ; i += 1 ) {
                gapi.signin.render(eles[i], {
                  'callback': 'googleSigninCallback',
                  'clientid': '592459906195-7sjc6v1cg6kf46vdhdvn8g2pvjbdn5ae.apps.googleusercontent.com',
                  // 'cookiepolicy': 'http://snappea.com',
                  'cookiepolicy': 'http://localhost:3501',
                  'data-apppackagename': 'com.snappea',
                  'scope': 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email'
                });
            }
        },

        getAccount : function () {
            var defer = $q.defer();
            if(!global.account){
                var authResult = global.authResult;
                gapi.auth.setToken(authResult);
                gapi.client.load('oauth2', 'v2', function() {
                  var request = gapi.client.oauth2.userinfo.get();
                  request.execute(function(obj){
                    global.account = obj['email'];
                    defer.resolve(global.account);
                    $rootScope.$apply();
                  });
                });
            }else{
                defer.resolve(global.account);
                //$rootScope.$apply();
            }
            return defer.promise;
        },

        getDevices : function () {

            $log.log('connecting for geting devices...');
            // Successfully authorized
            var authResult = this.authResult();
            var defer = $q.defer();
            $log.log(authResult['access_token']);

            //调用服务器端接口
            var url = 'http://192.168.100.24:8081/apppush/limbo?google_token=' + authResult['access_token'];
            $.ajax({
                type: 'GET',
                url: url,
                async: false,
                contentType: 'application/json',
                dataType: 'jsonp',
                success: function(data) {
                    $log.log('get devices success!');
                    $log.log(data);
                    defer.resolve(data);
                    global.defer.resolve(data);
                    $rootScope.$apply();
                    global.defer = $q.defer();
                },
                error: function(e) {
                    $log.error('get devices 403');
                    global.defer.reject(e);
                    $rootScope.$apply();
                }
            });

            return defer.promise;
        },

        callback : function (authResult) {
            if (authResult['access_token']) {
                this.authResult(authResult);
                this.getAccount();
                this.getDevices();
            } else if (authResult['error']) {
                //global.defer.resolve();
                // There was an error.
                // Possible error codes:
                //   "access_denied" - User denied access to your app
                //   "immediate_failed" - Could not automatically log in the user
                // console.log('There was an error: ' + authResult['error']);
                //$rootScope.$apply();
            }
        },

        signIn : function () {
            this.callback(global.authResult);
        },

        signOut : function () {
          global.defer = $q.defer();
          var defer = $q.defer();
          this.currentDevice({});
          window.localStorage.setItem('google_token','');
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
        }
    };

  return result;
}];
});
