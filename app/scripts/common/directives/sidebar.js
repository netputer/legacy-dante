define([
        'text!templates/common/sidebar.html'
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
                '$scope', 'wdAuthToken', 'wdGoogleSignIn', 'wdShare',
                'wdAlert', 'GA', '$rootScope', 'wdLanguageEnvironment',
                '$q', 'wdToast',  '$timeout',
        function($scope,   wdAuthToken,   wdGoogleSignIn,   wdShare,
                 wdAlert,  GA,    $rootScope,   wdLanguageEnvironment,
                 $q,   wdToast,   $timeout) {
            $scope.isLoadingDevices = true;
            $scope.isChangeDevicesPopShow = false;
            $scope.account = '';

            function clearLayersStatus() {
                $scope.devicesAnimate = false;
                $scope.devicesDefault = false;
                $scope.devicesHide = false;
                $scope.currentDeviceLayer = false;

                $scope.settingsAnimate = false;
                $scope.settingsDefault = false;
                $scope.settingsHide = false;
                $scope.settingsHideImmediate = false;
                $scope.currentSettingsLayer = false;
            }

            clearLayersStatus();

            $scope.closeSidebar = function() {
                $rootScope.showSidebar = false;
            };

            $rootScope.$on('sidebar:open', function() {
                wdGoogleSignIn.getAccount().then(function(data){
                    $scope.account = data;
                });

                wdGoogleSignIn.getProfileInfo().then(function(data) {
                    $scope.profileInfo = data;
                });
            });

            $rootScope.$on('sidebar:close', function() {
                $scope.closeSidebar();
            });

            $rootScope.$on('sidebar:devices:animate', function() {
                refreshDevices();
                clearLayersStatus();

                $scope.settingsHide = true;
                $scope.devicesAnimate = true;
                $scope.currentDeviceLayer = true;
            });

            $rootScope.$on('sidebar:devices:default', function() {
                refreshDevices();
                clearLayersStatus();

                $scope.settingsHideImmediate = true;
                $scope.devicesDefault = true;
                $scope.currentDeviceLayer = true;
            });

            $rootScope.$on('sidebar:settings:animate', function() {
                clearLayersStatus();
                $scope.settingsAnimate = true;
                $scope.devicesHide = true;
                $scope.currentSettingsLayer = true;
            });

            $rootScope.$on('sidebar:settings:default', function() {
                clearLayersStatus();
                $scope.settingsDefault = true;
                $scope.devicesHide = true;
            });     

            $rootScope.$on('sidebar:settings:animate', function() {
                clearLayersStatus();
                $scope.settingsAnimate = true;
                $scope.devicesHide = true;
                $scope.currentSettingsLayer = true;
            });

            $rootScope.$on('sidebar:settings:default', function() {
                clearLayersStatus();
                $scope.settingsDefault = true;
                $scope.devicesHide = true;
            });     

            $scope.addNewPhone = function () {
                $scope.isShowChangeDevicesPop = true;
            };

            $scope.changeDevice = function (item) {
                if(item['ip'] !== wdGoogleSignIn.currentDevice().ip){
                    wdGoogleSignIn.currentDevice(item);
                    wdAuthToken.signout();
                    refreshDevices();
                }
            };

            $scope.selectedLanguage = function(language) {
                return wdLanguageEnvironment.currentLanguageBelongsTo(language);
            };

            function refreshDevices() {
                $scope.deviceList = [];
                $timeout(function() {
                    $scope.isLoadingDevices = true;

                    (function getDevices() {
                        wdGoogleSignIn.getDevices().then(function(list){
                            $scope.isLoadingDevices = false;

                            $scope.deviceList = getListData(list);
                        },function(){
                            wdGoogleSignIn.setToken().then(function(){
                                getDevices();
                            });
                        });
                    })();
                }, 300);
            }

            function getListData(list) {
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
                var toastPromise = wdGoogleSignIn.signOut().then(null, function() {
                    return $q.reject($scope.$root.DICT.app.SIGN_OUT_ERROR_TOAST);
                });
                toastPromise.content = $scope.$root.DICT.app.SIGN_OUT_TOAST;
                wdToast.apply(toastPromise);
                toastPromise.then(function() {
                    wdGoogleSignIn.currentDevice({status:'signout'});
                    wdAuthToken.signout();
                });
            };

            //facebook
            $scope.isConnectedFacebook = function() {
                return wdShare.getIsConnectedFacebook();
            };

            wdShare.getFacebookLoginStatus();

            $scope.handleFacebookConnect = function() {
                if (wdShare.getIsConnectedFacebook()) {
                    wdAlert.confirm(
                        $scope.$root.DICT.app.DISCONNECT_FACEBOOK,
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
