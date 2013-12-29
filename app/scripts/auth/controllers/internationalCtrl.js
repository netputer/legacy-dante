define([
], function() {
'use strict';

return ['$scope', '$location', '$http', 'wdDev', '$route', '$timeout', 'wdDevice', 'GA', 'wdAlert', 'wdBrowser', '$rootScope', 'wdGoogleSignIn', '$log', '$window', 'wdLanguageEnvironment', 'wdToast', '$q', 'wdSigninDetection',
function internationalCtrl($scope, $location, $http, wdDev, $route, $timeout, wdDevice, GA, wdAlert, wdBrowser, $rootScope, wdGoogleSignIn, $log, $window, wdLanguageEnvironment, wdToast, $q, wdSigninDetection) {

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

        $scope.clickSignInButton = function() {
            $window.open(wdGoogleSignIn.signInUrl);          
            GA('user_sign_in:click_sign_in:google_sign_in');
        };

        //进入某个设备
        $scope.connectDevice = function(deviceData) {
            
            // 防止用户已经开始尝试连手机，但是没有结束，又再次连接。
            for (var m = 0, n = $scope.devicesList.length ; m < n ; m += 1) {
                if ($scope.devicesList[m].loading === true) {
                    return;
                }
            }
            GA('device_sign_in:select_existing_device:select_device_page');
            GA('connect_device:enter_snappea:'+ deviceData.model);
            GA('check_sign_in:auth_all:all');

            // 远程唤醒一下设备
            wdDevice.lightDeviceScreen(deviceData.id);
            if (deviceData.model) {
                $scope.signInProgress = $scope.$root.DICT.portal.SIGN_PROGRESS.STEP3.replace('$$$$', deviceData.model);
            }
            stopLoopGetDevicesList();
            
            //检测下是否是从url跳转过来的
            if (wdGoogleSignIn.getForceShowDevices()) {
                wdGoogleSignIn.setForceShowDevices(false);
                loopGetDevicesList(false);
                return;
            }

            var authCode = deviceData.authcode;
            var ip = deviceData.ip;
            var defer = $q.defer();
            $scope.state = 'loading';
            wdDev.setServer(ip);
            for (var i = 0, l = $scope.devicesList.length ; i < l ; i += 1) {
                if ($scope.devicesList[i].id === deviceData.id) {
                    $scope.devicesList[i].loading = true;
                }
            }

            // 下面方法统计是否超时会用到
            var timeStart = (new Date()).getTime();
            $http({
                method: 'get',
                url: '/directive/auth',
                timeout: 10000,
                params: {
                    authcode: authCode,
                    'client_time': (new Date()).getTime(),
                    'client_name': 'Browser',
                    'client_type': 3
                },
                // 自定义的，默认底层做错误控制，但是可以被调用方禁止，这样有些不合规则或遗留的api可以在应用层自己处理错误。
                disableErrorControl: !$scope.autoAuth
            })
            .success(function(response) {
                GA('connect_device:connect:success');
                GA('check_sign_in:auth:sucess');
                stopLoopGetDevicesList();

                //标记下已经登录设备，在切换设备的时候会判断这个。
                wdGoogleSignIn.setHasAccessdDevice();
                $scope.isLoadingDevices = false;
                wdDevice.setDevice(deviceData);
                wdDev.setMetaData(response);
                defer.resolve();
                //跳转到对应模块
                $location.url($route.current.params.ref || '/');
                $rootScope.$broadcast('signin');
            })
            .error(function(reason, status, headers, config) {

                // 再次远程唤醒设备
                wdDevice.lightDeviceScreen(deviceData.id);
                deviceData.loading = false;
                $scope.isLoadingDevices = false;
                defer.reject();
                wdGoogleSignIn.getDevices().then(function(list) {
                    $scope.devicesList = list;
                }, function(xhr) {
                    GA('check_sign_in:get_devices_failed:xhrError_' + xhr.status + '_connectDeviceFailed');
                }).always(function () {
                    wdAlert.confirm(
                        $scope.$root.DICT.portal.CONNECT_DEVICE_FAILED_POP.title,
                        $scope.$root.DICT.portal.CONNECT_DEVICE_FAILED_POP.content.replace('$$$$', deviceData.attributes.ssid),
                        $scope.$root.DICT.portal.CONNECT_DEVICE_FAILED_POP.OK,
                        $scope.$root.DICT.portal.CONNECT_DEVICE_FAILED_POP.CANCEL
                    ).then(function() {
                        GA('onboard:connect_confirm:retry');
                        $scope.isLoadingDevices = false;
                    }, function() {
                        GA('onboard:connect_confirm:cancel');
                        $scope.isLoadingDevices = false;

                        // 清除之前的设备信息
                        wdDevice.clearDevice();
                        loopGetDevicesList(false);
                    });                    
                });
                var action;
                var duration = Date.now() - timeStart;
                if (status === 0) {
                    action = (Math.round(duration / 1000) * 1000 < config.timeout) ? ('unreached:' + duration) : 'timeout';
                } else if (status === 401) {
                    action = 'reject:' + duration;
                } else {
                    action = 'unknown_' + status + ':' + duration;
                }
                GA('connect_device:connect:fail_' + action);
                GA('check_sign_in:auth:fail_' + action + '_' + deviceData.model);
            });
            return defer.promise;
        };

        function loopGetDevicesList(isAutoSignIn) {
            
            // 默认轮训发现一台设备会自动登录
            if (isAutoSignIn !== false) {
                isAutoSignIn = true;
            }
            $scope.loopDevicesList = wdGoogleSignIn.loopGetDevices();
            $scope.$watch('loopDevicesList', function(newData, oldData) {
                if (newData) {
                    getUserInfo();
                    GA('device_sign_in:add_new_device:new_device_page');
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
                            $scope.isLoadingDevices = false;
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
            }, function() {
                $scope.isLoadingDevices = false;
                stopLoopGetDevicesList();
                return $q.reject($scope.$root.DICT.app.SIGN_OUT_ERROR_TOAST);
            });
            toastPromise.content = $scope.$root.DICT.app.SIGN_OUT_TOAST;
            wdToast.apply(toastPromise);
        };

        $scope.showAddNewPhoneTip = function () {
            getUserInfo();
            $scope.isShowAddNewPhoneTip = true;
            GA('device_sign_in:add_new_device:select_device_page');
        };

        $scope.selectedLanguage = function(language) {
            return wdLanguageEnvironment.currentLanguageBelongsTo(language);
        };

        $scope.nextUserGuide = function() {
            $scope.userGuideStep += 1;
        };

        // 通过授权登陆后，执行的逻辑
        function googleSignIn() {
            GA('check_sign_in:google_page:success');
            $scope.isShowNoSignInPage = false;
            $scope.isLoadingDevices = true;
            $scope.signInProgress = $scope.$root.DICT.portal.SIGN_PROGRESS.STEP2;
            wdGoogleSignIn.getDevices().then(function(list) {
                showDevicesList(list);
                $scope.isOldUser = wdGoogleSignIn.isOldUser();
            },function(xhr) {
                GA('check_sign_in:get_devices_failed:xhrError_' + xhr.status + '_googleSignInFailed');
            });
        }

        //登录并取得了设备列表后，会执行的逻辑。
        function showDevicesList(list) {
            GA('user_sign_in:return_from_sign_in:google_sign_in');
            getUserInfo();
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
                        
                        // 防止已经登录在某手机中，又被登录一次。
                        // if (!wdGoogleSignIn.getHasAccessdDevice()) {
                            $scope.isLoadingDevices = true;
                            $scope.connectDevice(list[0]);
                        // }
                        $scope.devicesList = list;
                    break;
                    default:
                        $scope.isLoadingDevices = false;
                        $scope.devicesList = list;
                        loopGetDevicesList();
                    break;
                }
            }
        }

        //自动进入之前的设备
        function autoAccess() {
            $scope.signInProgress = $scope.$root.DICT.portal.SIGN_PROGRESS.STEP2;
            wdGoogleSignIn.getDevices().then(function(list) {
                if (list.length > 0) {
                    $scope.isOldUser = wdGoogleSignIn.isOldUser();
                    showDevicesList(list);
                    return;
                }
                if (list.length && $scope.autoAuth && $scope.auth && $scope.auth.ip) {
                    $scope.isLoadingDevices = true;
                    GA('device_sign_in:check_last_device:device_signed_in');
                    for (var i = 0, l = list.length; i < l; i += 1) {
                        if (list[i].id === $scope.auth.id) {
                            $scope.connectDevice(list[i]);
                            return;
                        }
                    }
                } else {
                    GA('device_sign_in:check_last_device:device_not_signed_in');
                    $scope.autoAuth = false;
                }
                showDevicesList(list);
            },function(xhr) {
                GA('check_sign_in:get_devices_failed:xhrError_' + xhr.status + '_autoAccessFailed');
                autoSignInGoogle();
            });
        }

        function getUserInfo() {
            wdGoogleSignIn.getProfile().then(function(data) {
                $scope.profile = data;
            });
        }

        function autoSignInGoogle() {
            $scope.isLoadingDevices = true;
            GA('user_sign_in:auto_sign_in:google_sign_in');
            autoAccess();
        }

        function signoutFromDevices() {
            $scope.isLoadingDevices = true;
            
            //用户是想要切换到另一个设备
            var item = wdDevice.getDevice();
            
            //判断用户是否在设备数据页面退出
            if (!item) {
                $scope.googleSignOut();
            } else if (!!item.status && item.status === 'devices') {
                wdGoogleSignIn.getDevices().then(function(list) {
                    getUserInfo();
                    $scope.isLoadingDevices = false;
                    $scope.devicesList = list;
                    loopGetDevicesList(false);
                },function(xhr) {
                    GA('check_sign_in:get_devices_failed:xhrError_' + xhr.status + '_signoutFromDevicesFailed');
                });
            } else if (!!item && !!item.ip) {

                //切换设备
                $scope.connectDevice(item);
            }
        }

// 登录逻辑开始（进入系统后首先走这个逻辑）
        GA('user_sign_in:check_sign_in:total_visits');

        //检测是否曾经登录过
        wdGoogleSignIn.checkSignIn().then(function() {
            $scope.isShowNoSignInPage = false;

            //是否是从其他设备退出准备切换设备
            if (wdGoogleSignIn.getHasAccessdDevice()) {
                signoutFromDevices();
            } else {
                autoSignInGoogle();
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
