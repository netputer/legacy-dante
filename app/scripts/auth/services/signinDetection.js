define([], function () {
'use strict';
return ['$window', 'wdGoogleSignIn', 'wdDevice', '$rootScope', '$location',
function ($window, wdGoogleSignIn, wdDevice, $rootScope, $location) {
    
    // 该模块来监测用户在其他窗口下的登陆状态，如果登陆则全部登陆，如果退出则全部退出。
    var signInDetectionFun = function(e) {
        if (e && event.key === 'signInFlag' && wdGoogleSignIn.isSignIn()) {
            
            // 非主要窗口，直接刷新浏览器，自动重新登陆
            $window.location.reload();
        }
    };

    var signOutDetectionFun = function(e) {
        if (e && event.key === 'signInFlag' && !wdGoogleSignIn.isSignIn()) {
            
            // 非主要窗口，直接刷新浏览器，需重新登陆
            $window.location.reload();
        }
    };

    // 添加 localStorge 事件监听
    function addStorageEvent(fun) {
        if (window.addEventListener) {
            window.addEventListener('storage', fun);
        } else if (window.attachEvent) {
            window.attachEvent('onstorage', fun);
        }
    }

    function removeStorageEvent(fun) {
        if (window.removeEventListener) {
            window.removeEventListener('storage', fun);
        } else if (window.detachEvent) {
            window.detachEvent('onstorage', fun);
        }
    }

    var result = {

        //监视是否在其他窗口登陆了。
        startSigninDetection: function() {
            addStorageEvent(signInDetectionFun);
        },
        stopSigninDetection: function() {
            removeStorageEvent(signInDetectionFun);
        },
        
        // 用来检测是否在其他窗口退出了
        startSignoutDetection: function() {
            addStorageEvent(signOutDetectionFun);
        },
        stopSignoutDetection: function() {
            removeStorageEvent(signOutDetectionFun);
        }

    };
    return result;
}];
});
