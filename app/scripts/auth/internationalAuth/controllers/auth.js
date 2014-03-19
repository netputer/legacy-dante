define([
    'underscore'
], function(_) {
'use strict';
return [
    '$scope', '$location', 'wdDev', '$route', '$timeout', 'wdDevice', 'GA', 'wdAlert', 'wdBrowser', '$rootScope', 
    'wdInternationalAuth', '$log', '$window', 'wdLanguageEnvironment', 'wdToast', '$q', 'wdSignInDetection', 'wdConnection',
function internationalCtrl(
    $scope,    $location,   wdDev,   $route,   $timeout,   wdDevice,   GA,   wdAlert,   wdBrowser,   $rootScope,
    wdInternationalAuth,   $log,    $window,   wdLanguageEnvironment,   wdToast,   $q,   wdSignInDetection,   wdConnection) {
    
    var remoteConnectionAuthDeivceTimes;
    var maxNormalAuthDeviceTimes;
    function resetDefaultMaxRetryTimes() {
        remoteConnectionAuthDeivceTimes = 3;
        maxNormalAuthDeviceTimes = 3;
    }
    resetDefaultMaxRetryTimes();

    $scope.isSupport = $window.Modernizr.cors && $window.Modernizr.websockets;
    $scope.isSafari = wdBrowser.safari;
    $scope.auth = wdDevice.getDevice() || '';
    $scope.autoAuth = !!$scope.auth;

    $scope.isShowAddNewPhoneTip = false;

    $scope.signInProgress = $scope.$root.DICT.portal.SIGN_PROGRESS.STEP1;

    $scope.devicesList = [];

    $scope.isShowNoSignInPage = true;

    $scope.accountEmail = '';

    $scope.isOldUser = wdInternationalAuth.isOldUser();

    $scope.userGuideStep = 1;

    if (!$scope.isSupport) {
        GA('login:not_support');
    }

    $scope.safariHelp = function() {
        wdAlert.alert($scope.$root.DICT.portal.SAFARI_TITLE, $scope.$root.DICT.portal.SAFARI_CONTENT);
    };

    $scope.clickSignInButton = wdInternationalAuth.signIn;

    // connect device
    $scope.connectDevice = function(deviceData) {
        wdDev.closeRemoteConnection();
        
        //test whether is redirection url
        if (wdInternationalAuth.getForceShowDevices()) {
            wdInternationalAuth.setForceShowDevices(false);
            stopLoopGetDevicesList();
            loopGetDevicesList(false);
            $scope.isLoadingDevices = false;
            return;
        }

        // prevent more times click
        for (var m = 0, n = $scope.devicesList.length; m < n; m += 1) {
            if ($scope.devicesList[m].loading === true) {
                return;
            }
        }

        if (deviceData.model) {
            $scope.signInProgress = $scope.$root.DICT.portal.SIGN_PROGRESS.STEP3.replace('$$$$', deviceData.model);
        }

        stopLoopGetDevicesList();

        GA('device_sign_in:select_existing_device:select_device_page');

        if (!deviceData.ip) {
            wdAlert.confirm(
                $rootScope.DICT.portal.WAP_CONNECTION_ALERT.TITLE,
                $rootScope.DICT.portal.WAP_CONNECTION_ALERT.CONTENT,
                $rootScope.DICT.portal.WAP_CONNECTION_ALERT.OK,
                $rootScope.DICT.portal.CONNECT_DEVICE_FAILED_POP.CANCEL
            ).then(function() {
                GA('connection:confirm_ask_use_3g:use');
                $scope.signInProgress = $scope.$root.DICT.portal.SIGN_PROGRESS.USE_UER_DATA;
                remoteConnect(deviceData);
            }, function() {
                GA('connection:confirm_ask_use_3g:cancel');
                clearStatus(deviceData);
                loopGetDevicesList(false);
            });

        } else {
            resetDefaultMaxRetryTimes();
            return authDevice(deviceData);
        }
    };

    function connectDeivceSuccessCallback() {
        //mark device which connected successfully 
        wdInternationalAuth.setHasAccessdDevice();
        $scope.isLoadingDevices = false;

        $location.url($route.current.params.ref || '/');
        $rootScope.$broadcast('signin');
    }

    function authDevice(deviceData) {
        maxNormalAuthDeviceTimes -= 1;
        
        // Won't connect device if device is connecting
        if (!setDeviceConnectingStatus(deviceData)) {
            clearStatus(deviceData);
            return;
        }

        wdConnection.connectDevice(deviceData).then(function () {
            connectDeivceSuccessCallback();

            GA('connection:access_device:success_direct');
        }, function () {
            wdDevice.clearDevice();

            if (maxNormalAuthDeviceTimes > 0) {
                wdDevice.lightDeviceScreen(deviceData.id);

                wdDevice.getDeviceList().then(function (list) {
                    $scope.devicesList = list;
                }).always(function () {
                    authDevice(deviceData);
                });
            } else {
                // fire remote connect
                $scope.signInProgress = $scope.$root.DICT.portal.SIGN_PROGRESS.WIFI;
                remoteConnect(deviceData);
            }
        });
    }

    function setDeviceConnectingStatus(deviceData) {
        var device = _.find($scope.devicesList, function(item) {
            return item.id === deviceData.id;
        });

        if (device) {
            $scope.devicesList.forEach(function(item, index) {
                if (item.id === deviceData.id && !item.loading) {
                    item.loading = true;
                }
            });
        }

        return device;
    }

    function remoteConnect(deviceData) {
        var pattern = deviceData.ip ? 'wifi' : '3g';
        setDeviceConnectingStatus(deviceData);

        wdConnection.wakeupServerWithRetry(deviceData).then(function(data) {

            wdConnection.connectDeviceWithRetry(deviceData).then(function() {
                wdDev.setRemoteConnectionData(data);
                connectDeivceSuccessCallback();

                GA('connection:access_device:success_' + pattern);
            }, function() {
                clearStatus(deviceData);
                wdDev.closeRemoteConnection();
                confirmConnect(deviceData);

                GA('connection:access_device:failed_' + pattern);
            });
        }, function() {
            confirmConnect(deviceData);
            
            GA('connection:access_device:failed_' + pattern + '_server');
        });
    }

    function confirmConnect(deviceData) {
        var defer = $q.defer();

        clearStatus(deviceData);

        wdAlert.confirm(
            $scope.$root.DICT.portal.CONNECT_DEVICE_FAILED_POP.title,
            $scope.$root.DICT.portal.CONNECT_DEVICE_FAILED_POP.content.replace('$$$$', deviceData.attributes.ssid),
            $scope.$root.DICT.portal.CONNECT_DEVICE_FAILED_POP.OK,
            $scope.$root.DICT.portal.CONNECT_DEVICE_FAILED_POP.CANCEL
        ).then(function() {
            GA('connection:confirm_ask_retry:retry');

            resetDefaultMaxRetryTimes();
            $scope.devicesList.forEach(function(item, index) {
                if (item.id === deviceData.id && !item.loading) {
                    item.loading = true;
                }
            });
            wdDevice.getDeviceList().then(function (list) {
                $scope.devicesList = list;
            }).always(function () {
                if (deviceData.ip) {
                    authDevice(deviceData);
                } else {
                    remoteConnect(deviceData, true);
                }
            });

            defer.resolve();
        }, function() {
            GA('connection:confirm_ask_retry:cancel');

            clearStatus(deviceData);
            wdDev.closeRemoteConnection();
            loopGetDevicesList(false);

            defer.reject();
        });

        return defer.promise;
    }

    function clearStatus(deviceData) {
        $scope.isLoadingDevices = false;
        $scope.devicesList.forEach(function(item, index) {
            if (item.id === deviceData.id) {
                item.loading = false;
            }
        });
    }

    function loopGetDevicesList(isAutoSignIn) {
        
        // default connect device when device list not empty
        if (!arguments.length) {
            isAutoSignIn = true;
        }
        //$scope.loopDevicesList = wdDevice.loopGetDeviceList();
        wdDevice.loopGetDeviceList().then(function(list) {
            $scope.loopDevicesList = list;

            $scope.$watch('loopDevicesList', function(newData, oldData) {
                $scope.isLoadingDevices = false;
                
                if (oldData !== $scope.devicesList || newData !== oldData) {
                    for (var i = 0 , l = $scope.devicesList.length ; i < l ; i += 1) {
                        if ($scope.devicesList[i].loading === true ) {
                            for (var m = 0 , n = newData.length; m < n; m += 1) {
                                if (newData[m].id === $scope.devicesList[i].id) {
                                    newData[m].loading = true;
                                }
                            }
                        } else {
                            $scope.devicesList[i].loading = false;
                        }
                    }
                    $scope.devicesList = newData;

                    switch ($scope.devicesList.length) {
                        case 1:
                            if (isAutoSignIn) {
                                GA('device_sign_in:found_new_device:new_device_page');
                                GA('device_sign_in:check_first_device:device_signed_in');
                                $scope.connectDevice($scope.devicesList[0]);
                            }
                        break;
                        default:
                            $scope.devicesList = $scope.devicesList;
                        break;
                    }
                }
            }, true);
        });
        
    }

    function stopLoopGetDevicesList() {
        wdDevice.stopLoopGetDeviceList();
    }

    $scope.googleSignOut = function() {
        var toastPromise = wdInternationalAuth.signout().then(function() {
            $scope.isLoadingDevices = false;
            $scope.isShowNoSignInPage = true;
            stopLoopGetDevicesList();
            wdSignInDetection.stopSignOutDetection();
            
            wdSignInDetection.startSignInDetection();
        }, function() {
            $scope.isLoadingDevices = false;
            stopLoopGetDevicesList();
            return $q.reject($scope.$root.DICT.app.SIGN_OUT_ERROR_TOAST);
        });
        toastPromise.content = $scope.$root.DICT.app.SIGN_OUT_TOAST;
        wdToast.apply(toastPromise);
    };

    $scope.showAddNewPhoneTip = function () {
        $scope.isShowAddNewPhoneTip = true;
        GA('device_sign_in:add_new_device:select_device_page');
    };

    $scope.selectedLanguage = function(language) {
        return wdLanguageEnvironment.currentLanguageBelongsTo(language);
    };

    $scope.nextUserGuide = function() {
        $scope.userGuideStep += 1;
    };

    function showDevicesList(list) {
        if (list) {
            $scope.devicesList = list;
            if ($scope.devicesList.length > 0) {
                GA('device_sign_in:check_all_devices:device_signed_in');
            }
            switch (list.length) {
                case 0:
                    GA('device_sign_in:check_first_device:device_not_signed_in');
                    GA('device_sign_in:check_all_devices:device_not_signed_in');
                    $scope.isLoadingDevices = false;
                    loopGetDevicesList();
                break;
                case 1:
                    GA('device_sign_in:check_first_device:device_signed_in');
                    $scope.isLoadingDevices = true;
                    $scope.connectDevice(list[0]);
                break;
                default:
                    $scope.isLoadingDevices = false;
                    loopGetDevicesList(false);
                break;
            }
        }
    }

    function autoAccessDevice() {
        $scope.signInProgress = $scope.$root.DICT.portal.SIGN_PROGRESS.STEP2;
        wdDevice.getDeviceList().then(function(list) {
            $scope.devicesList = list;
            if (list.length && $scope.autoAuth && $scope.auth) {
                $scope.isLoadingDevices = true;
                GA('device_sign_in:check_last_device:device_signed_in');
                for (var i = 0, l = list.length; i < l; i += 1) {
                    if (list[i].id === $scope.auth.id) {
                        $scope.connectDevice(list[i]);
                        return;
                    }
                }
                loopGetDevicesList(false);
            } else {
                GA('device_sign_in:check_last_device:device_not_signed_in');
                $scope.autoAuth = false;
                loopGetDevicesList();
            }
        }, function(xhr) {
            loopGetDevicesList();
        });
    }

    function getUserInfo() {
        wdInternationalAuth.getProfile().then(function(data) {
            $scope.profile = data;
        });
    }

    function autoSignIn() {
        $scope.isLoadingDevices = true;
        GA('user_sign_in:auto_sign_in:google_sign_in');
        getUserInfo();
        $scope.isOldUser = wdInternationalAuth.isOldUser();

        // whether auto auth the device that connected successfully last time
        if ($scope.autoAuth) {
            GA('connection:request_category:auto_access');
            autoAccessDevice();
        } else {
            GA('connection:request_category:switch_device_devices_list');
            wdDevice.getDeviceList().then(function (list) {
                showDevicesList(list);
            }, function() {
                loopGetDevicesList();
            });
        }
    }

    // 从设备退出，会走这个逻辑，判断是要完全退出 Limbo 还是要切换设备，还是直接要显示设备列表。
    function signoutFromDevices() {
        getUserInfo();
        
        //用户是想要切换到另一个设备
        var item = wdDevice.getDevice();
        
        //判断用户是否在设备数据页面退出
        if (!item) {
            $scope.googleSignOut();
            return;
        }

        wdDevice.getDeviceList().then(function(list) {

            $scope.devicesList = list;
            // 显示设备列表
            if (!!item.status && item.status === 'devices') {
                $scope.isLoadingDevices = false;
                loopGetDevicesList(false);
            } else {

                //切换设备
                $scope.isLoadingDevices = false;
                $scope.devicesList = list;
                $scope.connectDevice(item);
            }
        });
    }

// 登录逻辑开始（进入系统后首先走这个逻辑）
    GA('user_sign_in:check_sign_in:total_visits');

    //检测是否曾经登录过
    if (wdInternationalAuth.isSignIn()) {
        $scope.isShowNoSignInPage = false;
        $scope.isLoadingDevices = true;
    } else {

        // 检测是否在其他页面登陆，或者在弹出窗口登陆等
        wdSignInDetection.startSignInDetection();
    }
    
    // 检测是否真正登录
    wdInternationalAuth.checkAuthStatus().then(function() {
        $scope.isShowNoSignInPage = false;
        wdSignInDetection.stopSignInDetection();

        // 检测是否在其他页面退出
        wdSignInDetection.startSignOutDetection();

        //是否是从其他设备退出准备切换设备
        if (wdInternationalAuth.getHasAccessdDevice()) {
            signoutFromDevices();
        } else {
            autoSignIn();
        }
    }, function() {

        // 显示登录界面，点击按钮授权登录
        GA('user_sign_in:no_sign_in');
        $scope.isShowNoSignInPage = true;
        $scope.isLoadingDevices = false;
    });

    $scope.$on('$destroy', function() {
        stopLoopGetDevicesList();
    });

    $window.onunload = function() {
        if ($scope.devicesList.length > 0) {
            GA('device_sign_in:leave_page:new_device_page');
        }
    };

}];
});
