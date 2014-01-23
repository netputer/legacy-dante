define([
    'underscore'
], function(_) {
'use strict';
return ['$scope', '$location', 'wdDev', '$route', '$timeout', 'wdDevice', 'GA', 'wdAlert', 'wdBrowser', '$rootScope', 'wdGoogleSignIn', '$log', '$window', 'wdLanguageEnvironment', 'wdToast', '$q', 'wdSignInDetection', 'wdConnect',
function internationalCtrl($scope, $location, wdDev, $route, $timeout, wdDevice, GA, wdAlert, wdBrowser, $rootScope, wdGoogleSignIn, $log, $window, wdLanguageEnvironment, wdToast, $q, wdSignInDetection, wdConnect) {
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

    //是否显示多设备列表下的添加新设备提示
    $scope.isShowAddNewPhoneTip = false;

    // 是否显示用户引导
    $scope.signInProgress = $scope.$root.DICT.portal.SIGN_PROGRESS.STEP1;

    //设备列表
    $scope.devicesList = [];

    //是否显示注册界面
    $scope.isShowNoSignInPage = true;

    //显示的账号的名称，在dom中有默认的名称
    $scope.accountEmail = '';

    //是否为老用户
    $scope.isOldUser = wdGoogleSignIn.isOldUser();

    //用户引导页面，显示到第几步
    $scope.userGuideStep = 1;

    if (!$scope.isSupport) {
        GA('login:not_support');
    }

    $scope.safariHelp = function() {
        wdAlert.alert($scope.$root.DICT.portal.SAFARI_TITLE, $scope.$root.DICT.portal.SAFARI_CONTENT);
    };

    // 点击登陆按钮，弹出登陆窗
    $scope.clickSignInButton = function() {
        var width = 500;
        var height = 600;
        var top = 50;

        // 弹出窗横向居中
        var left = Math.round($window.screen.width - width) / 2;
        $window.open(wdGoogleSignIn.signInUrl, 'Limbo', 'fullscreen=no,width=' + width + ',height=' + height + ',top=' + top + ',left=' + left);          
        GA('user_sign_in:click_sign_in:google_sign_in');
    };

    // 进入某个设备
    $scope.connectDevice = function(deviceData) {
        wdDev.closeRemoteConnection();
        
        //检测下是否是从url跳转过来的
        if (wdGoogleSignIn.getForceShowDevices()) {
            wdGoogleSignIn.setForceShowDevices(false);
            stopLoopGetDevicesList();
            loopGetDevicesList(false);
            $scope.isLoadingDevices = false;
            return;
        }

        // 防止用户已经开始尝试连手机，但是没有结束，又再次连接。(防止多次点击)
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

    // 请求 auth
    function authDevice(deviceData) {
        if (!wdDev.isRemoteConnection()) {
            maxNormalAuthDeviceTimes -= 1;
        }
        
        if (!setDeviceConnectingStatus(deviceData)) {
            clearStatus(deviceData);
            return;
        }
        var TIME_SPAN = 3000;
        var timestamp = new Date().getTime();
        var defer = $q.defer();
        
        // 调用纯净的连接设备接口
        wdConnect.connectDevice(deviceData).then(function () {

            //标记下已经登录设备，在切换设备的时候会判断这个。
            wdGoogleSignIn.setHasAccessdDevice();
            $scope.isLoadingDevices = false;
            if (!wdDev.getRequestWithRemote()) {
                GA('connection:access_device:success_direct');
            } else {
                GA('connection:access_device:success_wifi');
            }
            defer.resolve();

            //跳转到对应模块
            $location.url($route.current.params.ref || '/');
            $rootScope.$broadcast('signin');

        }, function () {
         
            // 再次远程唤醒设备
            wdDevice.lightDeviceScreen(deviceData.id);
            
            // 清除之前的设备信息
            wdDevice.clearDevice();
            if (wdDev.isRemoteConnection()) {
                if (remoteConnectionAuthDeivceTimes) {
                    remoteConnectionAuthDeivceTimes -= 1;
                    var nowTimestamp = new Date().getTime();
                    var diff = nowTimestamp - timestamp;
                    if (diff > TIME_SPAN) {
                        authDevice(deviceData);
                    } else {
                        $timeout(function() {
                            authDevice(deviceData);
                        }, diff);
                    }
                    
                } else {
                    clearStatus(deviceData);
                    wdDev.closeRemoteConnection();
                    GA('connection:access_device:failed_wifi');
                    confirmConnect(deviceData);
                }
                
            } else if (maxNormalAuthDeviceTimes > 0) {
                wdDevice.lightDeviceScreen(deviceData.id);

                wdGoogleSignIn.getDevices().then(function (list) {
                    $scope.devicesList = list;
                }).always(function () {
                    authDevice(deviceData);
                });
            } else {
                // fire remote connect
                $scope.signInProgress = $scope.$root.DICT.portal.SIGN_PROGRESS.WIFI;
                remoteConnect(deviceData);
            }
            
            defer.reject();
        });

        return defer.promise;
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
        setDeviceConnectingStatus(deviceData);

        wdConnect.remoteConnectWithRetry(deviceData).then(function(data) {
            wdDev.setRequestWithRemote(data);

            wdConnect.connectDeviceWithRetry(deviceData).then(function() {
                wdDev.setRequestWithRemote(false);
                
                wdDev.setRemoteConnectionData(data);

                //标记下已经登录设备，在切换设备的时候会判断这个。
                wdGoogleSignIn.setHasAccessdDevice();
                $scope.isLoadingDevices = false;
                if (!deviceData.ip) {
                    GA('connection:access_device:success_3g');
                } else {
                    GA('connection:access_device:success_wifi');
                }
                //跳转到对应模块
                $location.url($route.current.params.ref || '/');
                $rootScope.$broadcast('signin');
            }, function() {
                wdDev.setRequestWithRemote(false);

                clearStatus(deviceData);
                wdDev.closeRemoteConnection();
                if (!deviceData.ip) {
                    GA('connection:access_device:failed_3g');
                } else {
                    GA('connection:access_device:failed_wifi');
                }
                confirmConnect(deviceData);
            });
        }, function() {
            if (!deviceData.ip) {
                GA('connection:access_device:failed_3g_server');
            } else {
                GA('connection:access_device:failed_wifi_server');
            }
            confirmConnect(deviceData);
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
            wdGoogleSignIn.getDevices().then(function (list) {
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
        
        // 默认轮训发现一台设备会自动登录
        if (!arguments.length) {
            isAutoSignIn = true;
        }
        $scope.loopDevicesList = wdGoogleSignIn.loopGetDevices();
        $scope.$watch('loopDevicesList', function(newData, oldData) {
            $scope.isLoadingDevices = false;
            
            // 首先确认 oldData 是否和当前数据一致，如果一致再看新老数据是否一致。
            if (oldData !== $scope.devicesList || newData !== oldData) {
                // GA('device_sign_in:add_new_device:new_device_page');
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
    }

    function stopLoopGetDevicesList() {
        wdGoogleSignIn.stopLoopGetDevices();
    }

    $scope.googleSignOut = function() {
        var toastPromise = wdGoogleSignIn.signout().then(function() {
            $scope.isLoadingDevices = false;
            $scope.isShowNoSignInPage = true;
            stopLoopGetDevicesList();
            wdSignInDetection.stopSignOutDetection();
            
            // 检测是否在其他页面登陆，或者在弹出窗口登陆等
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

    //登录并取得了设备列表后，会执行的逻辑。
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

    //自动进入之前的设备
    function autoAccessDevice() {
        $scope.signInProgress = $scope.$root.DICT.portal.SIGN_PROGRESS.STEP2;
        wdGoogleSignIn.getDevices().then(function(list) {
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
        wdGoogleSignIn.getProfile().then(function(data) {
            $scope.profile = data;
        });
    }

    // 已经登录自动进入的逻辑
    function autoSignIn() {
        $scope.isLoadingDevices = true;
        GA('user_sign_in:auto_sign_in:google_sign_in');
        getUserInfo();
        $scope.isOldUser = wdGoogleSignIn.isOldUser();

        // 是否自动进入上次连接过的设备
        if ($scope.autoAuth) {
            GA('connection:request_category:auto_access');
            autoAccessDevice();
        } else {
            GA('connection:request_category:switch_device_devices_list');
            wdGoogleSignIn.getDevices().then(function (list) {
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

        wdGoogleSignIn.getDevices().then(function(list) {

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
    if (wdGoogleSignIn.isSignIn()) {
        $scope.isShowNoSignInPage = false;
        $scope.isLoadingDevices = true;
    } else {

        // 检测是否在其他页面登陆，或者在弹出窗口登陆等
        wdSignInDetection.startSignInDetection();
    }
    
    // 检测是否真正登录
    wdGoogleSignIn.checkSignIn().then(function() {
        $scope.isShowNoSignInPage = false;
        wdSignInDetection.stopSignInDetection();

        // 检测是否在其他页面退出
        wdSignInDetection.startSignOutDetection();

        //是否是从其他设备退出准备切换设备
        if (wdGoogleSignIn.getHasAccessdDevice()) {
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

//return的最后括号
}];
});
