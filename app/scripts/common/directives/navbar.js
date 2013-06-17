define([
        'text!templates/common/navbar.html'
    ], function(
        template
    ) {
'use strict';
return [function() {
    return {
        restrict: 'EAC',
        replace: true,
        template: template,
        controller: [
                '$scope', 'wdAuthToken', '$route', 'wdSocket','wdGoogleSignIn',
        function($scope,   wdAuthToken,   $route,   wdSocket , wdGoogleSignIn) {
            $scope.messageNotification = false;
            $scope.isChangeDevicesPopShow = false;

            $scope.open = function() {
                $scope.isLoadDevices = true;
                wdGoogleSignIn.getDevices().then(function(list){
                    $scope.isLoadDevices = false;
                    $scope.devicesList = list;
                    $scope.$apply();
                });
            };

            $scope.signout = function() {
                wdGoogleSignIn.currentDevice({status:'signout'});
                wdAuthToken.signout();
            };

            $scope.changeDevice = function (item) {
                if(item['ip'] !== wdGoogleSignIn.currentDevice().ip){
                    wdGoogleSignIn.currentDevice(item);
                    wdAuthToken.signout();
                }
            };

            $scope.$on('$routeChangeSuccess', function(e, current) {
                if (current.locals.nav == null) { return; }

                $scope.currentModule = current.locals.nav;
                localStorage.setItem('lastModule', $scope.currentModule);

                if ($scope.currentModule === 'messages') {
                    $scope.messageNotification = false;
                    $scope.$root.restoreTitle();
                }
            });

            wdSocket.on('messages_add.wdNavbar', function(e) {
                if ($scope.currentModule !== 'messages') {
                    $scope.messageNotification = true;
                    if ($route.current.locals.nav != null &&
                        $route.current.locals.nav !== 'messages') {
                        $scope.$root.notifyNewMessage();
                    }
                }
            });

            $scope.clickAddNewPhone = function () {
                $scope.isChangeDevicesPopShow = true;
            };

            $scope.closeChangeDevicesPop = function () {
                $scope.isChangeDevicesPopShow = false;
            };
        }]
    };
}];
});
