define([
], function(){
return ['$scope', '$location', '$http', 'wdDev', '$route', '$timeout', 'wdAuthToken', 'wdKeeper', 'GA', 'wdAlert', 'wdBrowser', '$rootScope', 'wandoujiaSignIn', '$log', '$window',
function cloudDataCtrl($scope, $location, $http, wdDev, $route, $timeout, wdAuthToken, wdKeeper, GA, wdAlert, wdBrowser, $rootScope, wandoujiaSignIn, $log, $window) {

    $scope.isSupport = Modernizr.cors && Modernizr.websockets;
    $scope.isSafari = wdBrowser.safari;
    $scope.auth = wdAuthToken.getToken() || '';
    $scope.autoAuth = !!$scope.auth;
    $scope.error = '';
    $scope.state = 'standby';
    $scope.showHelp = false;
    $scope.authCallbackURL = encodeURIComponent($window.location.href);

    // if (!$scope.isSupport) {
    //     GA('login:not_support');
    // }

    $scope.openHelp = function() {
        $scope.showHelp = true;
    };
    $scope.safariHelp = function() {
        wdAlert.alert($scope.$root.DICT.portal.SAFARI_TITLE, $scope.$root.DICT.portal.SAFARI_CONTENT);
    };

    $scope.submit = function() {
        var host = 'sync.wandoujia.com';
        //>>includeStart("debug", pragmas.debug);
        host = 'sync-test.wandoujia.com';
        //>>includeEnd("debug");
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
        wdAuthToken.setToken({ip:host});
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
            ip : 'sync.wandoujia.com'
        };
        $scope.submit(item);
    },function(){
        wdAuthToken.signout();
    });

//return的最后括号
}];
});
