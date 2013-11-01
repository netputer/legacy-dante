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
            wdGoogleSignIn.renderGoogleSignIn(element[0]);
        });
    });
}

};
}];
});
