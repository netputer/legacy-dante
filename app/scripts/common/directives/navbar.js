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
        scope: true,
        controller: [
                '$scope', 'wdAuthToken', '$route', 'wdSocket', 'wdGoogleSignIn', 'wdShare',
                'wdAlert', '$window', 'GA', '$rootScope',
        function($scope,   wdAuthToken,   $route,   wdSocket ,  wdGoogleSignIn,   wdShare,
                 wdAlert,   $window, GA, $rootScope) {
            $scope.messageNotification = false;

            var currentLayer = '';

            $scope.controlSidebar = function(layer) {
                if (!$rootScope.showSidebar) {
                    $rootScope.$broadcast('sidebar:open');
                    $rootScope.$broadcast('sidebar:' + layer + ':default');

                    currentLayer = layer;
                    $rootScope.showSidebar = true;
                } else if (currentLayer === layer) {
                    $rootScope.$broadcast('sidebar:close');

                    currentLayer = '';
                    $rootScope.showSidebar = false;
                } else {
                    $rootScope.$broadcast('sidebar:' + layer + ':animate');

                    currentLayer = layer;
                    $rootScope.showSidebar = true;
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

        }]
    };
}];
});
