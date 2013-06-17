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
                '$scope', 'wdAuthToken', '$route', 'wdSocket','wdGoogleSignIn','wdKey',
        function($scope,   wdAuthToken,   $route,   wdSocket , wdGoogleSignIn , wdKey ) {
            $scope.messageNotification = false;
            $scope.isChangeDevicesPopShow = false;

            //快捷键
            var keyInfo;
            $scope.open = function() {
                $scope.isLoadDevices = true;
                wdGoogleSignIn.getDevices().then(function(list){
                    $scope.isLoadDevices = false;

                    //设备列表
                    $scope.devicesList = getListData (list);
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
                $scope.isChangeDevicesPopShow = true;
                keyInfo = wdKey.push('navbar');
            };

            $scope.closeChangeDevicesPop = function () {
                $scope.isChangeDevicesPopShow = false;
                keyInfo = wdKey.done;
            };

            wdKey.$apply('esc', 'navbar', function() {
                $scope.closeChangeDevicesPop();
            });

            $scope.$on('$destroy', function() {
                wdKey.deleteScope('navbar');
            });

        }]
    };
}];
});
