define([
], function(
) {
'use strict';
return ['wdGoogleSignIn', '$window', function(wdGoogleSignIn, $window) {
return {

link: function(scope, element) {
    //加载按钮的逻辑
    $window.googleSignInOnloadDefer.done(function() {
        //防止被弹窗拦截，需要先调用gapi.auth.init方法
        $window.gapi.auth.init(function() {
            $window.gapi.signin.render(element[0], {
                'clientid' : '592459906195-7sjc6v1cg6kf46vdhdvn8g2pvjbdn5ae.apps.googleusercontent.com',
                'cookiepolicy' : 'single_host_origin',
                'authuser' : '',
                'apppackagename' : 'com.snappea',
                'callback' : 'googleSignInCallback',
                'scope' : 'https://www.googleapis.com/auth/plus.me https://www.googleapis.com/auth/userinfo.email'                
            });
            $window.gapi.signin.go(element[0]);
        });
    });
}

};
}];
});
