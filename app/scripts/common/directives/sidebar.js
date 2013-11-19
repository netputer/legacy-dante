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
                '$scope', 'wdDevice', 'wdGoogleSignIn', 'wdShare',
                'wdAlert', 'GA', '$rootScope', 'wdLanguageEnvironment',
                '$q', 'wdToast',  '$timeout', '$window',
        function($scope,   wdDevice,  wdGoogleSignIn,   wdShare,
                 wdAlert,  GA,    $rootScope,   wdLanguageEnvironment,
                 $q,   wdToast,   $timeout, $window) {
            $scope.isLoadingDevices = false;
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
                $scope.isShowAddNewPhoneTips = !$scope.isShowAddNewPhoneTips;
            };

            $scope.changeDevice = function (item) {
                if(item.ip !== wdDevice.getDevice().ip){
                    wdDevice.signout();
                    wdDevice.setDevice(item);
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
                            wdGoogleSignIn.refreshToken(true).then(function(){
                                getDevices();
                            }, function() {
                                $scope.signout();
                            });
                        });
                    })();
                }, 300);
            }

            function getListData(list) {
                var device = wdDevice.getDevice();
                var ip ;
                if (device) {
                    ip = device.ip;
                    for (var i = 0 , l = list.length ; i < l ; i += 1) {
                        if (ip === list[i].ip) {
                            list[i].selected = true;
                        } else {
                            list[i].selected = false;
                        }
                    }
                    return list;
                } else {
                    return [];
                }
            }

            $scope.signout = function() {
                var toastPromise = wdGoogleSignIn.signout().then(function() {
                    // $window.location.reload();
                }, function() {
                    return $q.reject($scope.$root.DICT.app.SIGN_OUT_ERROR_TOAST);
                });
                toastPromise.content = $scope.$root.DICT.app.SIGN_OUT_TOAST;
                wdToast.apply(toastPromise);
                $scope.closeSidebar();
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
