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
                '$scope', 'wdAuthToken', '$route', 'wdSocket','wdGoogleSignIn',
        function($scope,   wdAuthToken,   $route,   wdSocket , wdGoogleSignIn) {
            $scope.messageNotification = false;
            $scope.isChangeDevicesPopShow = false;
            $scope.shownLanguageModal = false;
            $scope.account = '';

            $scope.open = function() {
                $scope.isLoadDevices = true;
                wdGoogleSignIn.getDevices().then(function(list){
                    $scope.isLoadDevices = false;

                    //设备列表
                    $scope.devicesList = getListData (list);
                },function(){
                    wdGoogleSignIn.setToken().then(function(){
                        $scope.open();
                    });
                });

                //取得账号
                wdGoogleSignIn.getAccount().then(function(data){
                    $scope.account = data;
                });

            };

            //处理原始的设备列表数据
            function getListData (list) {
                var ip = wdGoogleSignIn.currentDevice().ip;
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
                $scope.isShowChangeDevicesPop = true;
            };

            //facebook
            $scope.isConnectedFacebok = false;

            function setConnectFacebookFlag(response) {
                $scope.$apply(function() {
                    if (response.status === 'connected') {
                        $scope.isConnectedFacebok = true;
                    } else {
                        $scope.isConnectedFacebok = false;
                    }
                });
            }

            window.facebookInitDefer.done(function(Facebook) {
                Facebook.getLoginStatus(function(response) {
                    setConnectFacebookFlag(response);
                });
            });


            $scope.handleFacebookConnect = function() {
                window.facebookInitDefer.done(function(Facebook) {
                    if ($scope.isConnectedFacebok) {
                        Facebook.logout(function(response) {
                            setConnectFacebookFlag(response);
                        });
                    } else {
                        Facebook.login(function(response) {
                            setConnectFacebookFlag(response);
                        }, {scope : 'user_photos,publish_stream'});
                    }
                });
            };

        }]
    };
}];
});
