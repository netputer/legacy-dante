define([
        'text!templates/common/disconnect-panel.html'
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
                '$scope', '$rootScope',
        function($scope, $rootScope) {
            var connectTimer = null;
            var DELAY_TIME = 10;
            $scope.connectDelayTime = DELAY_TIME;
            $scope.showPanel = false;

            var refreshDelayTime = function() {
                connectTimer = setInterval(function() {
                    $scope.$apply(function() {
                        $scope.connectDelayTime -= 1;
                    });

                    if (!$scope.connectDelayTime) {
                        clearInterval(connectTimer);
                        $scope.connectDelayTime = DELAY_TIME;
                        $scope.connectSocket();
                    }
                }, 1000);
            };

            $rootScope.$on('socket:disconnected', function() {
                $scope.showPanel = true;

                refreshDelayTime();
            });

            $rootScope.$on('socket:connected', function() {
                $scope.showPanel = false;

                clearInterval(connectTimer);
            });

            $scope.connectSocket = function() {
                clearInterval(connectTimer);
                $scope.connectDelayTime = DELAY_TIME;
                refreshDelayTime();
                $rootScope.$broadcast('socket:connect');
            };

            $scope.closePanel = function() {
                $scope.showPanel = false;
            };
        }]
    };
}];
});