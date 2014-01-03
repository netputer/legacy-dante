define([], function () {
'use strict';
return ['$window', 'wdGoogleSignIn', 'wdDevice', '$rootScope', '$location',
function ($window, wdGoogleSignIn, wdDevice, $rootScope, $location) {
    
    // 该模块来监测用户在弹出窗口登陆或者在其他窗口登陆之后，当前页面也要登陆。如果是弹出层第一次登陆，登陆后弹出层应关闭。
    var signinDetectionTimer = null;
    var signoutDetectionTimer = null;

    var result = {

        //监视是否在其他窗口登陆了。
        startSigninDetection: function() {
            signinDetectionTimer = $window.setInterval(function () {
                if (signinDetectionTimer && wdGoogleSignIn.isSignIn()) {
                    // 重新登陆
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
                if (signoutDetectionTimer) {
                    me.stopSignoutDetection();
                    $rootScope.$apply(function() {
                        wdDevice.signout();
                    });
                }
            }, 3000);
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
