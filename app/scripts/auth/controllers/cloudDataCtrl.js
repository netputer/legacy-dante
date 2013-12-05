define([
], function(){
'use strict';

return ['$scope', '$location', '$http', 'wdDev', '$route', '$timeout', 'wdDevice', 'wdKeeper', 'GA', 'wdAlert', 'wdBrowser', '$rootScope', 'wandoujiaSignIn', '$log', '$window',
function cloudDataCtrl($scope, $location, $http, wdDev, $route, $timeout, wdDevice, wdKeeper, GA, wdAlert, wdBrowser, $rootScope, wandoujiaSignIn, $log, $window) {

    $scope.isSupport = window.Modernizr.cors && window.Modernizr.websockets;
    $scope.isSafari = wdBrowser.safari;
    $scope.auth = wdDevice.getDevice() || '';
    $scope.autoAuth = !!$scope.auth;
    $scope.error = '';
    $scope.state = 'standby';
    $scope.showHelp = false;
    $scope.authCallbackURL = encodeURIComponent($window.location.href);
    $scope.isCheckingLogin = true;

    var HOST = 'sync.wandoujia.com';
    //>>includeStart("debug", pragmas.debug);
    HOST = 'sync-test.wandoujia.com';
    //>>includeEnd("debug");

    // if (!$scope.isSupport) {
    //     GA('login:not_support');
    // }
    $scope.safariHelp = function() {
        wdAlert.alert($scope.$root.DICT.portal.SAFARI_TITLE, $scope.$root.DICT.portal.SAFARI_CONTENT);
    };

    $scope.submit = function() {
        var host = HOST;
        var port = 80;
        var keeper = null;
        $scope.state = 'loading';
        wdDev.setServer( host, port );
        keeper = wdKeeper.push($scope.$root.DICT.portal.KEEPER);
        var timeStart = (new Date()).getTime();

        //设置一个比较大的版本号，强制关掉版本控制
        wdDev.setMetaData({
            version_code : 9999
        });
        keeper.done();
        $scope.state = 'standby';
        // TODO: Maybe expiration?
        wdDevice.setDevice({ip:host});
        $location.url($route.current.params.ref || '/');
        $rootScope.$broadcast('signin');
    };

    // //自动进入之前的设备
    // if ( $scope.autoAuth && $scope.auth && $scope.auth.ip ) {
    //     $timeout(function() {
    //         GA('device_sign_in:check_last_device:device_signed_in');
    //         $scope.submit($scope.auth);
    //     }, 0);
    // }else{
    //     GA('device_sign_in:check_last_device:device_not_signed_in');
    //     $scope.autoAuth = false;
    // }

    $scope.$on('$destroy', function() {
    });

    //进入系统的主逻辑
    wandoujiaSignIn.getAccount().then(function(data){
        var item = {
            ip : HOST
        };
        $scope.submit(item);
    },function(){
        $scope.isCheckingLogin = false;
        wdDevice.signout();
    });

//return的最后括号
}];
});
