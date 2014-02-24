define([
        'text!templates/common/navbar.html'
    ], function(
        template
    ) {
'use strict';
return [function() {
    return {
        restrict: 'EAC',
        template: template,
        scope: true,
        controller: [
                '$scope', '$route', 'wdSocket', 'wdGoogleSignIn', 'wdShare',
                'wdAlert', '$window', 'GA', '$rootScope', 'wdDevice', 'wdDesktopNotification', 'wdUserSettings', 'wandoujiaSignIn',
        function($scope,   $route,   wdSocket ,  wdGoogleSignIn,   wdShare,
                 wdAlert,   $window,   GA,   $rootScope,   wdDevice,   wdDesktopNotification,   wdUserSettings, wandoujiaSignIn) {

            $scope.messageNotification = false;
            var currentLayer = '';

            if ($rootScope.READ_ONLY_FLAG) {
                $scope.wandoujiaSignOutUrl = wandoujiaSignIn.getSignOutUrl();
            }

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

            $window.playAlert.content['message'] = ['audio/message.ogg', 'audio/message.mp3'];
            wdSocket.on('messages_add.wdNavbar', function(e) {
                if (wdUserSettings.incomingMessageSoundEnabled() && !$rootScope.messageFocusMessageTextarea ) {
                    $window.playAlert('message');
                }
                if ($scope.currentModule !== 'messages') {
                    $scope.messageNotification = true;
                    if ($route.current.locals.nav != null &&
                        $route.current.locals.nav !== 'messages') {
                        $scope.$root.notifyNewMessage();
                    }
                }
            });
        }],
        link: function($scope, $element, $attrs, $controller) {
            var highlight = $element.find('.active-module-bg');
            $controller.highlightMoveTo = function(offset) {
                if (!highlight.hasClass('ready')) {
                    highlight.offset(offset).width();
                    highlight.addClass('ready');
                }
                else {
                    highlight.offset(offset);
                }
            };

            $scope.$on('signout', function() {
                highlight.removeClass('ready');
                $scope.currentModule = null;
            });
        }
    };
}];
});
