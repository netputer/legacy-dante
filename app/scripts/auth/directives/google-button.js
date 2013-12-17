define([
], function(
) {
'use strict';
return ['wdGoogleSignIn', '$window', function(wdGoogleSignIn, $window) {
return {

link: function(scope, element) {
    //加载按钮的逻辑
    $window.googleSignInOnloadDefer.done(function() {
        // 防止可能会被浏览器拦截弹窗
        $window.gapi.auth.init(function() {
            $window.gapi.signin.render(element[0], {
                'clientid' : '592459906195-7sjc6v1cg6kf46vdhdvn8g2pvjbdn5ae.apps.googleusercontent.com',
                'cookiepolicy' : 'single_host_origin',
                'authuser' : '',
                'apppackagename' : 'com.snappea',
                'callback' : 'googleSignInCallback',
                'scope' : 'https://www.googleapis.com/auth/plus.login https://www.googleapis.com/auth/userinfo.email'                
            });
        });
        // $window.gapi.signin.go(element[0]);
    });
}

};
}];
});
