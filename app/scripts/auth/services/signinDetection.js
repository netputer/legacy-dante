define([], function () {
'use strict';
return ['$window', 'wdGoogleSignIn', 'wdDevice', '$rootScope', '$location',
function ($window, wdGoogleSignIn, wdDevice, $rootScope, $location) {
    
    // 该模块来监测用户在其他窗口下的登陆状态，如果登陆则全部登陆，如果退出则全部退出。
    var signinDetectionTimer = null;
    var signoutDetectionTimer = null;

    var result = {

        //监视是否在其他窗口登陆了。
        startSigninDetection: function() {
            signinDetectionTimer = $window.setInterval(function () {
                if (signinDetectionTimer && wdGoogleSignIn.isSignIn()) {
                    // 非主要窗口，直接刷新浏览器，自动重新登陆
                    $window.location.reload();
                }
            }, 1000);
        },
        stopSigninDetection: function() {
            if (signinDetectionTimer) {
                $window.clearInterval(signinDetectionTimer);
                signinDetectionTimer = null;
            }
        },
        
        // 用来检测是否在其他窗口退出了
        startSignoutDetection: function() {
            var me = this;
            signoutDetectionTimer = $window.setInterval(function() {
                if (signoutDetectionTimer && !wdGoogleSignIn.isSignIn()) {
                    // 非主要窗口，直接刷新浏览器，需重新登陆
                    $window.location.reload();
                }
            }, 5000);
        },
        stopSignoutDetection: function() {
            if (signoutDetectionTimer) {
                $window.clearInterval(signoutDetectionTimer);
                signoutDetectionTimer = null;
            }
        }

    };
    return result;
}];
});
