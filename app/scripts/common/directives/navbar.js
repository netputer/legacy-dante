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
                '$scope', 'wdAuthToken', '$route', 'wdSocket',
        function($scope,   wdAuthToken,   $route,   wdSocket) {
            $scope.messageNotification = false;

            $scope.open = function() {
                $scope.xxx = true;
                setTimeout(function() {
                    $scope.xxx = false;
                    $scope.$apply();
                }, 2000);
            };

            $scope.signout = function() {
                wdAuthToken.signout();
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
        }]
    };
}];
});
