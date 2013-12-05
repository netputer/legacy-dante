define([
], function() {
'use strict';

return ['$scope', '$location', '$http', 'wdDev', '$route', '$timeout', 'wdDevice', 'GA', 'wdAlert', 'wdBrowser', '$rootScope', 'wdGoogleSignIn', '$log', '$window', 'wdLanguageEnvironment', 'wdToast', '$q',
function internationalCtrl($scope, $location, $http, wdDev, $route, $timeout, wdDevice, GA, wdAlert, wdBrowser, $rootScope, wdGoogleSignIn, $log, $window, wdLanguageEnvironment, wdToast, $q) {

        $scope.isSupport = $window.Modernizr.cors && $window.Modernizr.websockets;
        $scope.isSafari = wdBrowser.safari;
        $scope.auth = wdDevice.getDevice() || '';
        $scope.autoAuth = !!$scope.auth;
        $scope.buttonText = $scope.$root.DICT.portal.SIGN_IN;
        $scope.state = 'standby';
        $scope.showHelp = false;

        //是否显示多设备列表下的添加新设备提示
        $scope.isShowAddNewPhoneTip = false;

        // 是否显示用户引导
        $scope.isShowUserGuide = true;
        $scope.signInProgress = $scope.$root.DICT.portal.SIGN_PROGRESS.STEP1;

        //设备列表
        $scope.devicesList = [];

        //是否显示注册界面
        $scope.isShowNoSignInPage = true;

        //显示的账号的名称，在dom中有默认的名称
        $scope.accountEmail = '';
        $scope.signInBtnDisabled = true;

        //是否为老用户
        $scope.isOldUser = wdGoogleSignIn.isOldUser();

        //用户引导页面，显示到第几步
        $scope.userGuideStep = 1;

        if (!$scope.isSupport) {
            GA('login:not_support');
        }

        $scope.openHelp = function() {
            $scope.showHelp = true;
        };

        $scope.safariHelp = function() {
            wdAlert.alert($scope.$root.DICT.portal.SAFARI_TITLE, $scope.$root.DICT.portal.SAFARI_CONTENT);
        };

        $scope.userInput = function() {
            if ($scope.state !== 'standby') {
                return;
            }
            $scope.buttonText = $scope.$root.DICT.portal.SIGN_IN;
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
            if (deviceData.model) {
                $scope.signInProgress = $scope.$root.DICT.portal.SIGN_PROGRESS.STEP3.replace('$$$$', deviceData.model);
            }
            GA('connect_device:enter_snappea:'+ deviceData.model);
            GA('check_sign_in:auth_all:all');
            stopLoopGetDevicesList();

            //检测下是否是从url跳转过来的
            if (wdGoogleSignIn.getForceShowDevices()) {
                wdGoogleSignIn.setForceShowDevices(false);
                loopGetDevicesList(false);
                return;
            }

            deviceData = deviceData || wdDevice.getDevice();
            var authCode = deviceData.authcode;
            var ip = deviceData.ip;

            $scope.state = 'loading';
            wdDev.setServer(ip);
            var timeStart = (new Date()).getTime();
            for (var i = 0, l = $scope.devicesList.length ; i < l ; i += 1) {
                if ($scope.devicesList[i].id === deviceData.id) {
                    $scope.devicesList[i].loading = true;
                }
            }
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
                disableErrorControl: !$scope.autoAuth
            })
            .success(function(response) {
                GA('connect_device:connect:success');
                GA('check_sign_in:auth:sucess');
                stopLoopGetDevicesList();
                wdGoogleSignIn.setHasAccessdDevice();
                wdDevice.setDevice(deviceData);
                $scope.isLoadingDevices = false;
                $scope.state = 'standby';
                $scope.buttonText = $scope.$root.DICT.portal.AUTH_SUCCESS;
                // TODO: Maybe expiration?
                wdDevice.setDevice(deviceData);
                wdDevice.startSignoutDetection();
                wdDev.setMetaData(response);
                $location.url($route.current.params.ref || '/');
                $rootScope.$broadcast('signin');
            })
            .error(function(reason, status, headers, config) {
                wdDevice.lightDeviceScreen(deviceData.id);
                deviceData.loading = false;
                getUserInfo();
                wdGoogleSignIn.getDevices().then(function(list) {
                    $scope.isLoadingDevices = false;
                    $scope.devicesList = list;
                    wdAlert.confirm(
                        $scope.$root.DICT.portal.CONNECT_DEVICE_FAILED_POP.title,
                        $scope.$root.DICT.portal.CONNECT_DEVICE_FAILED_POP.content.replace('$$$$', deviceData.attributes.ssid),
                        $scope.$root.DICT.portal.CONNECT_DEVICE_FAILED_POP.OK,
                        $scope.$root.DICT.portal.CONNECT_DEVICE_FAILED_POP.CANCEL
                    ).then(function() {
                        $scope.isLoadingDevices = false;
                        $scope.connectDevice(deviceData);
                    }, function() {
                        $scope.isLoadingDevices = false;
                        wdDevice.clearDevice();
                        loopGetDevicesList(false);
                    });

                }, function() {
                    $scope.connectDevice(deviceData);
                });

                $scope.state = 'standby';
                var action;
                var duration = Date.now() - timeStart;
                if (status === 0) {
                    action = (Math.round(duration / 1000) * 1000 < config.timeout)  ? ('unreached:' + duration) : 'timeout';
                }
                else if (status === 401) {
                    action = 'reject:' + duration;
                }
                else {
                    action = 'unknown_' + status + ':' + duration;
                }
                GA('connect_device:connect:fail_' + action);
                GA('check_sign_in:auth:fail_' + action);
            });
        };

        function loopGetDevicesList(isAutoSignIn) {
            if (isAutoSignIn !== false) {
                isAutoSignIn = true;
            }
            $scope.loopDevicesList = wdGoogleSignIn.loopGetDevices();
            $scope.$watch('loopDevicesList', function(newData, oldData) {
                getUserInfo();
                if (oldData.length < newData.length) {
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
                }
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
            }, true);
        }

        function stopLoopGetDevicesList() {
            wdGoogleSignIn.stopLoopGetDevices();
        }

        $scope.ping = function(item) {
            if (!item.pingStatus) {
                item.pingStatus = true;
                wdDev.ping(item.ip).then(function() {
                    item.pingStatus = true;
                }, function() {
                    item.pingStatus = false;
                });
            }
            return item.pingStatus;
        };

        $scope.googleSignOut = function() {
            var toastPromise = wdGoogleSignIn.signout().then(function() {
                $scope.isLoadingDevices = false;
                $scope.signInBtnDisabled = false;
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

        $scope.clickSignInButton = function() {
            GA('user_sign_in:click_sign_in:google_sign_in');
            GA('check_sign_in:google_page_all:all');
        };

        $scope.nextUserGuide = function() {
            $scope.userGuideStep += 1;
        };

        //首次进入登陆界面
        $window.googleSignInEventCenter.on('googleSignInCallback', function(e, data){
            $scope.signInBtnDisabled = false;
            if (data.authResult.access_token && !hasSignInGoogle()) {
                googleSignIn();
            }
        });

        // 通过授权登陆后，执行的逻辑（第一次进入的登陆逻辑）
        function googleSignIn() {
            GA('check_sign_in:google_page:success');
            $scope.isShowNoSignInPage = false;
            $scope.isLoadingDevices = true;
            $scope.signInProgress = $scope.$root.DICT.portal.SIGN_PROGRESS.STEP2;
            wdGoogleSignIn.checkToken().then(function() {
                wdGoogleSignIn.getDevices().then(function(list) {
                    showDevicesList(list);
                    $scope.isOldUser = wdGoogleSignIn.isOldUser();
                },function() {
                    wdGoogleSignIn.checkToken().then(function() {
                        googleSignIn();
                    }, function() {
                        $scope.googleSignOut();
                    });
                });
            }, function() {
                $scope.googleSignOut();
            });
        }

        //登录并取得了设备列表后，会执行的逻辑。
        function showDevicesList(list) {
            GA('user_sign_in:return_from_sign_in:google_sign_in');
            getUserInfo();
            if (typeof list !== 'undefined') {
                for (var i = 0 , l = list.length ; i < l ; i += 1) {
                    list[i].loading = false;
                }
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
                        //防止已经登录在某手机中，又被登录一次。
                        if (!wdGoogleSignIn.getHasAccessdDevice()) {
                            $scope.isLoadingDevices = true;
                            $scope.connectDevice(list[0]);
                        }
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
                if (!list.length) {
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
                    showDevicesList(list);
                } else {
                    GA('device_sign_in:check_last_device:device_not_signed_in');
                    showDevicesList(list);
                    $scope.autoAuth = false;
                }
            },function() {
                autoSignInGoogle();
            });
        }

        function getUserInfo() {
            wdGoogleSignIn.getProfileInfo().then(function(data) {
                $scope.profile = data;
            });
        }

        function autoSignInGoogle() {
            $scope.signInBtnDisabled = false;
            $scope.isLoadingDevices = true;
            GA('user_sign_in:auto_sign_in:google_sign_in');
            $window.googleSignInOnloadDefer.done(function() {
                wdGoogleSignIn.checkToken().then(function() {
                    autoAccess();
                }, function() {
                    $scope.googleSignOut();
                });
            });
        }

        function signoutFromDevices() {

            // 当用户从其他设备中退出到当前页面时
            if (wdGoogleSignIn.getHasAccessdDevice()) {
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
                    },function() {
                        wdGoogleSignIn.checkToken().then(function(){
                            signoutFromDevices();
                        },function(){
                            $scope.googleSignOut();
                        });
                    });
                } else if (!!item && !!item.ip) {
                    //切换设备
                    $scope.connectDevice(item);
                }
                return true;
            } else {
                return false;
            }
        }

        function googleBtnOnload(){
            //加载按钮的逻辑
            $window.googleSignInOnloadDefer.done(function() {
                $scope.signInBtnDisabled = false;
                //异步需要apply()
                if (!wdGoogleSignIn.getHasAccessdDevice()) {
                    $scope.$apply();
                }
            });
        }

        //是否登录着 Google 账号
        function hasSignInGoogle() {
            return !!wdGoogleSignIn.getStorageItem('googleToken');
        }

// 登录逻辑开始（进入系统后首先走这个逻辑）
        GA('user_sign_in:check_sign_in:total_visits');

        //检测是否曾经登录过
        if (hasSignInGoogle()) {
            //是否是从其他设备退出准备切换设备
            $scope.isShowNoSignInPage = false;
            if (!signoutFromDevices()) {
                autoSignInGoogle();
            }

        } else {
            // 显示登录界面，点击按钮授权登录
            GA('user_sign_in:no_sign_in');
            googleBtnOnload();
            $scope.isShowNoSignInPage = true;
            $scope.isLoadingDevices = false;
        }

        $scope.$on('$destroy', function() {
            stopLoopGetDevicesList();
        });

        $window.onunload = function() {
            //包含了在这种情况下signout的人，因为signout会刷新浏览器
            if ($scope.devicesList.length > 0) {
                GA('device_sign_in:leave_page:new_device_page');
            }
        };

//return的最后括号
}];
});
