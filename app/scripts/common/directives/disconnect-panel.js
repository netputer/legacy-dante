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
                '$scope', '$rootScope', 'wdSocket', 'wdDevice',
        function($scope,   $rootScope,   wdSocket,   wdDevice) {
            var connectTimer = null;
            var DELAY_TIME = 10;
            $scope.connectDelayTime = DELAY_TIME;
            $scope.showPanel = false;

            var refreshDelayTime = function() {
                if (!!connectTimer) {
                    clearInterval(connectTimer);
                }
                connectTimer = setInterval(function() {
                    $scope.$apply(function() {
                        $scope.connectDelayTime -= 1;
                        
                        if (!$scope.connectDelayTime) {
                            $scope.connectSocket();
                        }
                    });
                }, 1000);
            };

            wdSocket.on('socket:disconnected', function() {
                $scope.network = wdDevice.getDevice().attributes.ssid;
                $scope.showPanel = true;

                refreshDelayTime();
            });

            wdSocket.on('socket:connected', function() {
                $scope.showPanel = false;

                clearInterval(connectTimer);
            });

            $rootScope.$on('signout', function() {
                $scope.closePanel();
            });

            $scope.connectSocket = function() {
                $scope.connectDelayTime = DELAY_TIME;
                wdSocket.trigger('socket:connect');
            };

            $scope.closePanel = function() {
                $scope.showPanel = false;
                if (connectTimer) {
                    clearInterval(connectTimer);
                }
            };
        }]
    };
}];
});