define([
], function(){
'use strict';

return ['$scope', '$location', '$http', 'wdDev', '$route', '$timeout', 'wdDevice', 'GA', 'wdAlert', 'wdBrowser', '$rootScope', 'wandoujiaSignIn', '$log', '$window',
function cloudDataCtrl($scope, $location, $http, wdDev, $route, $timeout, wdDevice, GA, wdAlert, wdBrowser, $rootScope, wandoujiaSignIn, $log, $window) {

    $scope.isSupport = window.Modernizr.cors && window.Modernizr.websockets;
    $scope.isSafari = wdBrowser.safari;
    $scope.auth = wdDevice.getDevice() || '';
    $scope.autoAuth = !!$scope.auth;
    $scope.state = 'standby';
    $scope.authCallbackURL = encodeURIComponent($window.location.href);
    $scope.isCheckingLogin = true;

    var HOST = 'sync.wandoujia.com';

    // if (!$scope.isSupport) {
    //     GA('login:not_support');
    // }
    $scope.safariHelp = function() {
        wdAlert.alert($scope.$root.DICT.portal.SAFARI_TITLE, $scope.$root.DICT.portal.SAFARI_CONTENT);
    };

    $scope.submit = function() {
        var host = HOST;
        var port = 80;
        $scope.state = 'loading';
        wdDev.setServer( host, port );
        var timeStart = (new Date()).getTime();

        //设置一个比较大的版本号，强制关掉版本控制
        wdDev.setMetaData({
            version_code : 9999
        });
        $scope.state = 'standby';
        // TODO: Maybe expiration?
        wdDevice.setDevice({ip:host});
        $location.url($route.current.params.ref || '/');
        $rootScope.$broadcast('signin');
    };

    $scope.$on('$destroy', function() {
    });

    //进入系统的主逻辑
    wandoujiaSignIn.checkSignIn().then(function(){
        var item = {
            ip : HOST
        };
        $scope.submit(item);
        GA('auth:wandoujia:success');
    },function(){
        $scope.isCheckingLogin = false;
        wdDevice.signout();
    });

//return的最后括号
}];
});
