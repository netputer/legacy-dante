define([
], function(){
return ['$scope', '$location', '$http', 'wdDev', '$route', '$timeout', 'wdAuthToken', 'wdKeeper', 'GA', 'wdAlert', 'wdBrowser', '$rootScope', 'wdGoogleSignIn', '$log', '$window',
function internationalCtrl($scope, $location, $http, wdDev, $route, $timeout, wdAuthToken, wdKeeper, GA, wdAlert, wdBrowser, $rootScope, wdGoogleSignIn, $log, $window) {

        $scope.isSupport = Modernizr.cors && Modernizr.websockets;
        $scope.isSafari = wdBrowser.safari;
        $scope.auth = wdAuthToken.getToken() || '';
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
        // $scope.signInBtnDisabled = true;

        googleSignInOnloadDefer.done(function(){
            gapi.auth.init(function(){
                // $scope.signInBtnDisabled = false;
                //异步需要apply()
                $scope.$apply();
            });
        });

        //检测是否曾经登陆过
        GA('user_sign_in:check_sign_in:total_visits');
        if( wdGoogleSignIn.getStorageItem('googleToken') ){
            $scope.isLoadingDevices = true;
            GA('user_sign_in:auto_sign_in:google_sign_in');
            googleSignInOnloadDefer.done(function(){
                gapi.auth.init(function(){
                    wdGoogleSignIn.refreshToken(true);
                    $scope.$apply();
                });
            });
        }else{
            GA('user_sign_in:no_sign_in');
            $scope.isLoadingDevices = false;
        }

        //轮询的timer，为false的时候可以执行轮询
        var loopGetDevicesTimer ;
        var loopLinkDevicesTimer ;

        if (!$scope.isSupport) {
            GA('login:not_support');
        }

    /*Start: remove after a week*/
        $scope.isShowAnnouncement = !wdGoogleSignIn.getStorageItem('closeAnnouncement');
        $scope.closeAnnouncement = function() {
            wdGoogleSignIn.setStorageItem('closeAnnouncement', 1);
            $scope.isShowAnnouncement = false;
        }
    /*End: remove after a week*/

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

            deviceData = deviceData || wdAuthToken.getToken();
            var authCode = deviceData['authcode'];
            var ip = deviceData['ip'];
            var port = 10208;

            var keeper = null;

            // Valid auth code.
            if (ip) {
                // Send auth request.
                $scope.state = 'loading';
                wdDev.setServer(ip, port);
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
                    wdGoogleSignIn.setIsLogin();
                    wdGoogleSignIn.currentDevice(deviceData);
                    $scope.isLoadingDevices = false;
                    keeper.done();
                    $scope.state = 'standby';
                    $scope.buttonText = $scope.$root.DICT.portal.AUTH_SUCCESS;
                    // TODO: Maybe expiration?
                    wdAuthToken.setToken(deviceData);
                    wdAuthToken.startSignoutDetection();
                    wdDev.setMetaData(response);
                    $location.url($route.current.params.ref || '/');
                    $rootScope.$broadcast('signin');
                })
                .error(function(reason, status) {
                    GA('connect_device:connect:fail');
                    // $scope.isLoadingDevices = false;
                    deviceData['loading'] = false;
                    if( !$scope.autoAuth ){
                        $scope.autoAuth = false;
                        wdAlert.alert(
                            $scope.$root.DICT.portal.CONNECT_DEVICE_FAILED_POP.title,
                            $scope.$root.DICT.portal.CONNECT_DEVICE_FAILED_POP.content + deviceData['attributes']['ssid'] + '.<br><a href="http://snappea.zendesk.com/entries/23341488--Official-How-do-I-sign-in-to-SnapPea-for-Web">More help»</a>',
                            $scope.$root.DICT.portal.CONNECT_DEVICE_FAILED_POP.button
                        ).then(function(){
                            // $scope.isLoadingDevices = false;
                        });
                    }
                    wdAuthToken.clearToken();
                    loopGetDevices();

                    keeper.done();
                    $scope.state = 'standby';
                    $scope.buttonText = $scope.$root.DICT.portal.AUTH_FAILED;
                    $scope.error = true;
                    $timeout(function() {
                        $scope.buttonText = $scope.$root.DICT.portal.SIGN_IN;
                        $scope.error = false;
                    }, 5000);
                    wdAuthToken.clearToken();
                    var action;
                    if (status === 0) {
                        action = 'timeout';
                    }
                    else if (status === 401) {
                        action = 'reject';
                    }
                    else {
                        action = 'unknown_' + status;
                    }
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

        //自动进入之前的设备
        if ( $scope.autoAuth && $scope.auth && $scope.auth.ip ) {
            $timeout(function() {
                GA('device_sign_in:check_last_device:device_signed_in');
                $scope.submit($scope.auth);
            }, 0);
        }else{
            GA('device_sign_in:check_last_device:device_not_signed_in');
            $scope.autoAuth = false;
        }

        //通过点击按钮登陆的逻辑
        function googleInit() {
            wdGoogleSignIn.ready().then(function(list){
                GA('user_sign_in:return_from_sign_in:google_sign_in');
                if( typeof list !== 'undefined' ){
                    for ( var i = 0 , l = list.length ; i < l ; i += 1 ) {
                        list[i]['loading'] = false;
                    }
                    $scope.deviceNum = list.length;
                    if( $scope.deviceNum > 0 ){
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
                            //防止已经登陆在某手机中，又被登陆一次。
                            if ( !wdGoogleSignIn.getIsLogin() ) {
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
            },function(error){
                $scope.googleSignOut();
            });
        }

        //轮询获取设备列表
        function loopGetDevices() {
            loopGetDevicesTimer = $timeout(function(){
                wdGoogleSignIn.getDevices().then(function(list){
                    if( $scope.deviceNum < list.length ){
                        GA('device_sign_in:add_new_device:new_device_page');
                    }
                    $scope.deviceNum = list.length;
                    for ( var i = 0 , l = list.length ; i < l ; i += 1 ) {
                        list[i]['loading'] = false;
                    }
                    wdGoogleSignIn.getAccount().then(function(data){
                        $scope.accountEmail = data;
                    });
                    switch(list.length){
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
                function(){
                    wdGoogleSignIn.refreshToken().then(function(){
                        loopGetDevices();
                    });
                });
            },3000);
        }

        function stopLoopGetDevices () {
            $timeout.cancel( loopGetDevicesTimer );
        }

        //轮询获取设备列表，如果有一个设备则登录
        function loopLinkDevices() {
            loopLinkDevicesTimer = $timeout(function(){
                wdGoogleSignIn.getDevices().then(function(list){
                    if( $scope.deviceNum < list.length ){
                        GA('device_sign_in:add_new_device:new_device_page');
                    }
                    wdGoogleSignIn.getAccount().then(function(data){
                        $scope.accountEmail = data;
                    });
                    if(list.length === 0){
                        loopLinkDevices();
                    }else{
                        GA('device_sign_in:found_new_device:new_device_page');
                        GA('device_sign_in:check_first_device:device_signed_in');
                        $scope.submit(list[0]);
                    }
                },
                function(){
                    wdGoogleSignIn.refreshToken().then(function(){
                        loopLinkDevices();
                    });
                });
            },3000);
        }

        function stopLoopLinkDevices () {
            $timeout.cancel( loopLinkDevicesTimer );
        }

        $scope.googleSigIn = function () {
            GA('user_sign_in:click_sign_in:google_sign_in');
            wdGoogleSignIn.refreshToken();
        };

        $scope.connectPhone = function (item) {
            item['loading'] = true;
            GA('device_sign_in:select_existing_device:select_device_page');
            $scope.submit(item);
        };

        $scope.googleSignOut = function () {
            $scope.isLoadingDevices = true;
            stopLoopLinkDevices();
            stopLoopGetDevices();
            wdGoogleSignIn.signOut().then(function(){
                // wdGoogleSignIn.render();
                // googleInit();
                // $scope.deviceNum = -1;
                // $scope.isLoadingDevices = false;
                wdAuthToken.clearToken();
                wdGoogleSignIn.removeStorageItem('googleToken');
                //这要重新刷新浏览器，就是因为登陆整个环节依托与wdGoogleSignIn中的Global.defer，但是这玩意只能被触发一次。
                $window.location.reload();
            },function(){
                $scope.googleSignOut();
            });
        };

        $scope.showConnectNewPhone = function () {
            $scope.isShowChangeDevicesPop = true;
            GA('device_sign_in:add_new_device:select_device_page');
        };

        // 当用户从其他设备中退出到当前页面时
        if( wdGoogleSignIn.getIsLogin() ){
            $scope.isLoadingDevices = true;
            //用户是想要切换到另一个设备
            var item = wdGoogleSignIn.currentDevice();
            if(!!item.status && item.status === 'signout'){
                $scope.googleSignOut();
                return;
            }
            if(!!item && !!item.ip){
                $scope.submit(item);
            }else{
                wdGoogleSignIn.getDevices().then(function(list){
                    if($scope.autoAuth){
                        $scope.isLoadingDevices = true;
                    }else{
                        $scope.isLoadingDevices = false;
                    }
                    switch(list.length){
                        case 0:
                            loopGetDevices();
                        break;
                        default:
                            $scope.deviceNum = list.length;
                            $scope.devicesList = list;
                            loopGetDevices();
                        break;
                    }
                },function(){
                    wdGoogleSignIn.refreshToken();
                });
            }

        }else{
            googleInit();
        }

        $scope.$on('$destroy', function() {
            stopLoopLinkDevices();
            stopLoopGetDevices();
        });

        $window.onunload = function(){
            //包含了在这种情况下signout的人，因为signout会刷新浏览器
            if( $scope.deviceNum > 0 ){
                GA('device_sign_in:leave_page:new_device_page');
            }
        }

//return的最后括号
}];
});
