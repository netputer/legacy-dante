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
                '$scope', '$route', 'wdSocket', 'wdGoogleSignIn', 'wdShare',
                'wdAlert', '$window', 'GA', '$rootScope', 'wdDevice',
        function($scope,   $route,   wdSocket ,  wdGoogleSignIn,   wdShare,
                 wdAlert,   $window, GA, $rootScope, wdDevice) {
            $scope.messageNotification = false;
            $scope.isChangeDevicesPopShow = false;
            $scope.shownLanguageModal = false;
            $scope.account = '';
            $scope.authCallbackURL = encodeURIComponent($window.location.href);

            $scope.open = function() {
                $scope.isLoadDevices = true;
                wdGoogleSignIn.getDevices().then(function(list){
                    $scope.isLoadDevices = false;

                    //设备列表
                    $scope.devicesList = getListData (list);
                },function(){
                    wdGoogleSignIn.refreshToken(true).then(function(){
                        $scope.open();
                    }, function(){
                        $scope.devicesList = [];
                    });
                });

                //取得账号
                wdGoogleSignIn.getAccount().then(function(data){
                    $scope.account = data;
                });

            };

            //处理原始的设备列表数据
            function getListData (list) {
                var ip = wdDevice.getDevice().ip;
                for ( var i = 0 , l = list.length ; i < l ; i += 1 ) {
                    if ( ip === list[i]['ip'] ) {
                        list[i]['selected'] = true;
                    }else{
                        list[i]['selected'] = false;
                    }
                }
                return list;
            }

            $scope.signout = function() {
                wdDevice.signout();
                wdDevice.setDevice({status:'signout'});
            };

            $scope.changeDevice = function (item) {
                if(item['ip'] !== wdDevice.getDevice().ip){
                    wdDevice.signout();
                    wdDevice.setDevice(item);
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
                $scope.isShowChangeDevicesPop = true;
            };

            //facebook
            $scope.isConnectedFacebook = function() {
                return wdShare.getIsConnectedFacebook();
            };

            wdShare.getFacebookLoginStatus();

            $scope.handleFacebookConnect = function() {
                if (wdShare.getIsConnectedFacebook()) {
                    wdAlert.confirm(
                        $scope.$root.DICT.app.NAVBAR_DISCONNECT_FACEBOOK_TIP,
                        $scope.$root.DICT.app.DISCONNECT_FACEBOOK_INFO,
                        $scope.$root.DICT.app.DISCONNECT
                    ).then(function() {
                        wdShare.disconnectFacebook();
                    });

                    GA('navbar:facebook_logout');
                } else {
                    wdShare.connectFacebook();

                    GA('navbar:facebook_login');
                }
            };

        }]
    };
}];
});
