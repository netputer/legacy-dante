define([
], function(){
'use strict';

return  ['$scope',  '$http',      'wdDev',           'wdDevice', 
         'wdAlert', 'wdBrowser', '$rootScope', 'wdWandoujiaAuth', '$window', '$location', '$route',
function ($scope,    $http,        wdDev,             wdDevice, 
          wdAlert,   wdBrowser,   $rootScope,   wdWandoujiaAuth,   $window,  $location, $route) {
    
    $scope.isSupport = window.Modernizr.cors && window.Modernizr.websockets;
    $scope.isSafari = wdBrowser.safari;
    $scope.auth = wdDevice.getDevice() || '';
    $scope.autoAuth = !!$scope.auth;
    $scope.state = 'standby';
    $scope.authCallbackURL = encodeURIComponent($window.location.href);
    $scope.isCheckingLogin = true;

    var HOST = 'sync.wandoujia.com';
    var PORT = '80';

    $scope.safariHelp = function() {
        wdAlert.alert($scope.$root.DICT.portal.SAFARI_TITLE, $scope.$root.DICT.portal.SAFARI_CONTENT);
    };

    $scope.submit = function() {
        $scope.state = 'standby';
        $rootScope.$broadcast('SignInSucceed');
        var deviceInfo = {
            ip : HOST,
            port: PORT
        };

        $rootScope.$broadcast('SelectDevice', deviceInfo);
    };

    //进入系统的主逻辑
    wdWandoujiaAuth.checkAuthStatus().then(function(data){
        $scope.submit();
    },function(){
        $scope.isCheckingLogin = false;
        wdDevice.signOut();
    });

}];
});
