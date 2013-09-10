define([
], function() {
'use strict';

return ['$scope', '$location', '$http', 'wdDev', '$route', '$timeout', 'wdDevice', 'wdKeeper', 'GA', 'wdAlert', 'wdBrowser', '$rootScope', 'wdGoogleSignIn', '$log', '$window', 'wdLanguageEnvironment',
function internationalCtrl($scope, $location, $http, wdDev, $route, $timeout, wdDevice, wdKeeper, GA, wdAlert, wdBrowser, $rootScope, wdGoogleSignIn, $log, $window, wdLanguageEnvironment) {

        $scope.isSupport = $window.Modernizr.cors && $window.Modernizr.websockets;
        $scope.isSafari = wdBrowser.safari;
        $scope.auth = wdDevice.getDevice() || '';
        $scope.autoAuth = !!$scope.auth;
        $scope.buttonText = $scope.$root.DICT.portal.SIGN_IN;
        $scope.error = '';
        $scope.state = 'standby';
        $scope.showHelp = false;
        $scope.isShowChangeDevicesPop = false;

        //设备的数量
        $scope.deviceNum = -1;

        //设备列表
        $scope.devicesList = [];

        //显示的账号的名称，在dom中有默认的名称
        $scope.accountEmail = '';
        $scope.signInBtnDisabled = true;

        //轮询的timer，为false的时候可以执行轮询
        var loopGetDevicesTimer ;
        var loopLinkDevicesTimer ;

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
        $scope.submit = function(deviceData) {
            GA('connect_device:enter_snappea:'+ deviceData['model']);
            // $scope.isLoadingDevices = true;
            stopLoopGetDevices();
            stopLoopLinkDevices();

            //检测下是否是从url跳转过来的
            if ( wdGoogleSignIn.getForceShowDevices()) {
                wdGoogleSignIn.setForceShowDevices(false);
                // $scope.isLoadingDevices = false;
                loopGetDevices();
                return;
            }

            deviceData = deviceData || wdDevice.getDevice();
            var authCode = deviceData['authcode'];
            var ip = deviceData['ip'];

            var keeper = null;

            // Valid auth code.
            if (ip) {
                // Send auth request.
                $scope.state = 'loading';
                wdDev.setServer(ip);
                keeper = wdKeeper.push($scope.$root.DICT.portal.KEEPER);
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
                    disableErrorControl: !$scope.autoAuth
                })
                .success(function(response) {
                    GA('connect_device:connect:success');
                    stopLoopGetDevices();
                    stopLoopLinkDevices();
                    wdGoogleSignIn.setHasAccessdDevice();
                    wdDevice.setDevice(deviceData);
                    $scope.isLoadingDevices = false;
                    keeper.done();
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
                    GA('connect_device:connect:fail');
                    deviceData['loading'] = false;
                    if ( !$scope.autoAuth ) {
                        $scope.autoAuth = false;
                        wdAlert.alert(
                            $scope.$root.DICT.portal.CONNECT_DEVICE_FAILED_POP.title,
                            $scope.$root.DICT.portal.CONNECT_DEVICE_FAILED_POP.content + deviceData['attributes']['ssid'] + '.<br><a href="http://snappea.zendesk.com/entries/23341488--Official-How-do-I-sign-in-to-SnapPea-for-Web">More help»</a>',
                            $scope.$root.DICT.portal.CONNECT_DEVICE_FAILED_POP.button
                        ).then(function() {
                            // $scope.isLoadingDevices = false;
                        });
                    }
                    wdDevice.clearDevice();
                    loopGetDevices();

                    keeper.done();
                    $scope.state = 'standby';
                    $scope.buttonText = $scope.$root.DICT.portal.AUTH_FAILED;
                    $scope.error = true;
                    $timeout(function() {
                        $scope.buttonText = $scope.$root.DICT.portal.SIGN_IN;
                        $scope.error = false;
                    }, 5000);
                    wdDevice.clearDevice();
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
                });
            }
            // Invalid auth code.
            else {
                $scope.error = true;
                $timeout(function() {
                    $scope.error = false;
                }, 5000);
            }
        };

        //轮询获取设备列表
        function loopGetDevices() {
            loopGetDevicesTimer = $timeout(function() {
                wdGoogleSignIn.getDevices().then(function(list) {
                    if (!loopGetDevicesTimer) {
                        return;
                    }
                    if ( $scope.deviceNum < list.length ) {
                        GA('device_sign_in:add_new_device:new_device_page');
                    }
                    $scope.deviceNum = list.length;
                    for ( var i = 0 , l = list.length ; i < l ; i += 1 ) {
                        list[i].loading = false;
                    }
                    wdGoogleSignIn.getAccount().then(function(data) {
                        $scope.accountEmail = data;
                    });
                    switch(list.length) {
                        case 0:
                            loopLinkDevices();
                        break;
                        default:
                            $scope.isLoadingDevices = false;
                            $scope.devicesList = list;
                            loopGetDevices();
                        break;
                    }
                },
                function() {
                    if (!loopGetDevicesTimer) {
                        return;
                    }
                    wdGoogleSignIn.refreshToken(true).then(function() {
                        loopGetDevices();
                    },function(){
                        $scope.googleSignOut();
                    });
                });
            }, 7000);
        }

        function stopLoopGetDevices () {
            $timeout.cancel(loopGetDevicesTimer);
            loopGetDevicesTimer = null;
        }

        //轮询获取设备列表，如果有一个设备则登录
        function loopLinkDevices() {
            loopLinkDevicesTimer = $timeout(function() {
                wdGoogleSignIn.getDevices().then(function(list) {
                    if (!loopLinkDevicesTimer) {
                        return;
                    }
                    if ( $scope.deviceNum < list.length ) {
                        GA('device_sign_in:add_new_device:new_device_page');
                    }
                    wdGoogleSignIn.getAccount().then(function(data) {
                        $scope.accountEmail = data;
                    });
                    if (list.length === 0) {
                        loopLinkDevices();
                    } else {
                        GA('device_sign_in:found_new_device:new_device_page');
                        GA('device_sign_in:check_first_device:device_signed_in');
                        $scope.submit(list[0]);
                    }
                },
                function() {
                    if (!loopLinkDevicesTimer) {
                        return;
                    }
                    wdGoogleSignIn.refreshToken(true).then(function() {
                        loopLinkDevices();
                    },function() {
                        $scope.googleSignOut();
                    });
                });
            }, 3000);
        }

        function stopLoopLinkDevices () {
            $timeout.cancel(loopLinkDevicesTimer);
            loopLinkDevicesTimer = null;
        }

        $scope.connectPhone = function (item) {
            item['loading'] = true;
            GA('device_sign_in:select_existing_device:select_device_page');
            $scope.submit(item);
        };

        $scope.ping = function(item) {
            if (!item.pingStatus) {
                item.pingStatus = true;
                wdDev.ping( item.ip ).then(function() {
                    item.pingStatus = true;
                }, function() {
                    item.pingStatus = false;
                });
            }
            return item.pingStatus;
        };

        $scope.googleSignOut = function () {
            $scope.isLoadingDevices = true;
            stopLoopLinkDevices();
            stopLoopGetDevices();
            wdDevice.clearDevice();
            wdGoogleSignIn.signOut();
            wdGoogleSignIn.removeStorageItem('googleToken');
            //这要重新刷新浏览器，就是因为登录整个环节依托与wdGoogleSignIn中的Global.defer，但是这玩意只能被触发一次。
            $window.location.reload();
        };

        $scope.showConnectNewPhone = function () {
            $scope.isShowChangeDevicesPop = true;
            GA('device_sign_in:add_new_device:select_device_page');
        };

        $scope.selectedLanguage = function(language) {
            return wdLanguageEnvironment.currentLanguageBelongsTo(language);
        };

        $scope.googleSigIn = function () {
            GA('user_sign_in:click_sign_in:google_sign_in');
            GA('check_sign_in:google_page_all:all');
            wdGoogleSignIn.refreshToken().then(function() {
                GA('check_sign_in:google_page:success');
                $scope.isLoadingDevices = true;
                wdGoogleSignIn.getDevices().then(function( list ) {
                    showDevicesList( list );
                },function() {
                    $scope.isLoadingDevices = false;
                });
            },function() {
                //Google 登陆界面用户未操作
                GA('check_sign_in:google_page:fail');
            });
        };

        //登录并取得了设备列表后，会执行的逻辑。
        function showDevicesList( list ) {
            GA('user_sign_in:return_from_sign_in:google_sign_in');
            if ( typeof list !== 'undefined' ) {
                for ( var i = 0 , l = list.length ; i < l ; i += 1 ) {
                    list[i]['loading'] = false;
                }
                $scope.deviceNum = list.length;
                if ( $scope.deviceNum > 0 ) {
                    GA('device_sign_in:check_all_devices:device_signed_in');
                }
                switch ( list.length ) {
                    case 0:
                        GA('device_sign_in:check_first_device:device_not_signed_in');
                        GA('device_sign_in:check_all_devices:device_not_signed_in');
                        $scope.isLoadingDevices = false;
                        loopLinkDevices();
                    break;
                    case 1:
                        GA('device_sign_in:check_first_device:device_signed_in');
                        //防止已经登录在某手机中，又被登录一次。
                        if ( !wdGoogleSignIn.getHasAccessdDevice() ) {
                            $scope.isLoadingDevices = true;
                            $scope.submit(list[0]);
                        }
                        $scope.devicesList = list;
                    break;
                    default:
                        $scope.isLoadingDevices = false;
                        $scope.devicesList = list;
                        loopGetDevices();
                    break;
                }
            }
        }

        //自动进入之前的设备
        function autoAccess() {
            wdGoogleSignIn.getDevices().then(function(list) {
                if ( !list.length ) {
                    showDevicesList( list );
                    return;
                }
                if ( $scope.autoAuth && $scope.auth && $scope.auth.ip ) {
                    $timeout(function() {
                        GA('device_sign_in:check_last_device:device_signed_in');
                        list.forEach(function( value, index ) {
                            if ( value.id === $scope.auth.id) {
                                $scope.submit( value );
                            } else if ( index === (list.length - 1) ) {
                                showDevicesList( list );
                            }
                        });
                    }, 0);
                } else {
                    GA('device_sign_in:check_last_device:device_not_signed_in');
                    showDevicesList( list );
                    $scope.autoAuth = false;
                }
            },function() {
                autoSignInGoogle();
            });
        }

        //如果用户登录过，自动去 Google 刷新一下token.
        function autoSignInGoogle() {
            $scope.isLoadingDevices = true;
            GA('user_sign_in:auto_sign_in:google_sign_in');
            $window.googleSignInOnloadDefer.done(function() {
                $window.gapi.auth.init(function() {
                    wdGoogleSignIn.refreshToken(true).then(function(data) {
                        //重新获得token成功
                        autoAccess();
                    },function() {
                        //重新获得token失败
                        $scope.googleSignOut();
                    });
                });
            });
        }

        function signOutFromDevices() {

            // 当用户从其他设备中退出到当前页面时
            if ( wdGoogleSignIn.getHasAccessdDevice() ) {
                $scope.isLoadingDevices = true;
                //用户是想要切换到另一个设备
                var item = wdDevice.getDevice();
                //判断用户是否在设备数据页面退出
                if (!!item.status && item.status === 'signout') {
                    $scope.googleSignOut();
                    return;
                }
                //判断用户是否要切换设备
                if (!!item && !!item.ip) {
                    $scope.submit(item);
                } else {
                    wdGoogleSignIn.getDevices().then(function(list) {
                        if ($scope.autoAuth) {
                            $scope.isLoadingDevices = true;
                        } else {
                            $scope.isLoadingDevices = false;
                        }
                        switch(list.length) {
                            case 0:
                                loopGetDevices();
                            break;
                            default:
                                $scope.deviceNum = list.length;
                                $scope.devicesList = list;
                                loopGetDevices();
                            break;
                        }
                    },function() {
                        wdGoogleSignIn.refreshToken(true).then(function(){
                            signOutFromDevices();
                        },function(){
                            $scope.googleSignOut();
                        });
                    });
                }
                return true;
            } else {
                return false;
            }
        }

        function googleBtnOnload(){
            //加载按钮的逻辑
            $window.googleSignInOnloadDefer.done(function() {
                //防止被弹窗拦截，需要先调用gapi.auth.init方法
                $window.gapi.auth.init(function() {
                    $scope.signInBtnDisabled = false;
                    //异步需要apply()
                    $scope.$apply();
                });
            });
        }

// 登录逻辑开始
        GA('user_sign_in:check_sign_in:total_visits');

        //检测是否曾经登录过
        if ( wdGoogleSignIn.getStorageItem('googleToken') ) {
            //是否是从其他设备退出准备切换设备
            if (!signOutFromDevices()) {
                autoSignInGoogle();
            }
        } else {
            // 显示登录界面，点击按钮授权登录
            GA('user_sign_in:no_sign_in');
            googleBtnOnload();
            $scope.isLoadingDevices = false;
        }

        $scope.$on('$destroy', function() {
            stopLoopLinkDevices();
            stopLoopGetDevices();
        });

        $window.onunload = function() {
            //包含了在这种情况下signout的人，因为signout会刷新浏览器
            if ( $scope.deviceNum > 0 ) {
                GA('device_sign_in:leave_page:new_device_page');
            }
        };

//return的最后括号
}];
});
