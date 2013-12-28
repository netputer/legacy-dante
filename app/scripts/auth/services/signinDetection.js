define([], function () {
'use strict';
return ['$window', 'wdGoogleSignIn', 'wdDevice', '$rootScope',
function ($window, wdGoogleSignIn, wdDevice, $rootScope) {
    
    // 该模块来监测用户在弹出窗口登陆或者在其他窗口登陆之后，当前页面也要登陆。如果是弹出层第一次登陆，登陆后弹出层应关闭。
    var signinDetectionTimer = null;
    var signoutDetectionTimer = null;


    // 关闭当前窗口
    function closeWindow() {
        $window.opener = null;
        $window.open('', '_self');
        $window.close();
    }

    var result = {
        startSigninDetection: function() {
            signinDetectionTimer = $window.setInterval(function () {
                if (signinDetectionTimer && $window.localStorage.getItem('signInFlag')) {
                    $window.location.reload();
                }
            }, 3000);
        },
        stopSigninDetection: function() {
            $window.clearInterval(signinDetectionTimer);
            signinDetectionTimer = null;
        },
        
        // 用来检测是否在其他窗口退出了
        startSignoutDetection: function() {
            var me = this;
            signoutDetectionTimer = $window.setInterval(function() {
                if (signoutDetectionTimer && !$window.localStorage.getItem('signInFlag')) {
                    me.stopSignoutDetection();
                    $rootScope.$apply(function() {
                        wdDevice.signout();
                    });
                }
            }, 1000);
        },
        stopSignoutDetection: function() {
            $window.clearInterval(signoutDetectionTimer);
            signoutDetectionTimer = null;
        }

    };
    return result;
}];
});
