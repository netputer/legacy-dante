/*global Modernizr*/
define([
    'angular',
    'auth/services/token',
    'auth/services/googleSignIn'
], function(
    angular,
    authToken,
    googleSignIn
    // googleSignInBtn
) {
'use strict';

angular.module('wdAuth', ['wdCommon'])
    .provider('wdAuthToken', authToken)
    .factory('wdGoogleSignIn',googleSignIn)
    .controller('portalController', ['$scope', '$location', '$http', 'wdDev', '$route', '$timeout', 'wdAuthToken', 'wdKeeper', 'GA', 'wdAlert', 'wdBrowser', '$rootScope', 'wdGoogleSignIn', '$log', '$window',
        function($scope, $location, $http, wdDev, $route, $timeout, wdAuthToken, wdKeeper, GA, wdAlert, wdBrowser, $rootScope, wdGoogleSignIn, $log, $window) {

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

        //显示的账号的名称
        $scope.accountEmail = 'the same account';

        function loopSetToken() {
            if ( typeof(gapi) === 'undefined' || typeof(gapi.auth) === 'undefined' || typeof(gapi.auth.authorize) === 'undefined' ){
                setTimeout(loopSetToken,16);
            }else{
                wdGoogleSignIn.setToken(true);
            }
        }

        //检测是否曾经登陆过
        GA('user_sign_in:check_sign_in:total_visits');
        if( window.localStorage.getItem('googleToken') ){
            $scope.isLoadingDevices = true;
            GA('user_sign_in:auto_sign_in:google_sign_in');
            loopSetToken();
        }else{
            GA('user_sign_in:no_sign_in');
            $scope.isLoadingDevices = false;
        }

        //轮询的timer
        var loopGetDevicesTimer;
        var loopLinkDevicesTimer;

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

        $scope.submit = function(deviceData) {
            //$scope.isLoadingDevices = true;
            stopLoopGetDevices();
            stopLoopLinkDevices();
            deviceData = deviceData || wdAuthToken.getToken();
            var authCode = deviceData['authcode'];
            // if (!authCode) {
            //     GA('login:enter_authcode:empty');
            //     return;
            // }
            // Parse data source.
            //var ip = wdAuthToken.parse(authCode);
            var ip = deviceData['ip'];
            var port = 10208;

            var keeper = null;

            // Valid auth code.
            if (ip) {
                if ($scope.autoAuth) {
                    // GA('login:auto_authcode:valid');
                }
                else {
                    // GA('login:enter_authcode:valid');
                }
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
                    // $scope.isLoadingDevices = false;
                    deviceData['loading'] = false;
                    wdAlert.alert('Connect failed', 'Please check your network and your phone and computer are on the same Wi-Fi network.<br><a href="http://snappea.zendesk.com/entries/23341488--Official-How-do-I-sign-in-to-SnapPea-for-Web">More help»</a>', 'OK').then(function(){});
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

        if ($location.search().help === 'getstarted') {
            $scope.autoAuth = false;
            $timeout(function() {
                $scope.showHelp = true;
            }, 0);
        }
        //自动进入之前的设备
        else if ($scope.auth.ip) {
            $timeout(function() {
                GA('device_sign_in:check_all_devices:device_sign_in');
                $scope.submit($scope.auth);
            }, 0);
        }else if (!$scope.auth.ip){
            GA('device_sign_in:check_all_devices:device_not_sign_in');
            $scope.autoAuth = false;
        }

        function googleInit() {
            wdGoogleSignIn.init().then(function(list){
                GA('user_sign_in:return_from_sign_in:google_sign_in');
                if( typeof list !== 'undefined' ){
                    for ( var i = 0 , l = list.length ; i < l ; i += 1 ) {
                        list[i]['loading'] = false;
                    }
                    $scope.deviceNum = list.length;
                    switch ( list.length ) {
                        case 0:
                            $scope.isLoadingDevices = false;
                            loopLinkDevices();
                        break;
                        case 1:
                            $scope.isLoadingDevices = true;
                            $scope.devicesList = list;
                            $scope.submit(list[0]);
                        break;
                        default:
                            $scope.isLoadingDevices = false;
                            $scope.devicesList = list;
                            loopGetDevices();
                        break;
                    }
                }
            },function(error){
                $window.localStorage.removeItem('googleToken');
                $scope.googleSignOut();
            });
        }

        //轮询获取设备列表
        function loopGetDevices() {
            loopGetDevicesTimer = setTimeout(function(){
                wdGoogleSignIn.getDevices().then(function(list){
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
                    wdGoogleSignIn.setToken().then(function(){
                        loopGetDevices();
                    });
                });
            },3000);
        }

        function stopLoopGetDevices () {
            clearTimeout(loopGetDevicesTimer);
        }

        //轮询获取设备列表，如果有一个设备则登录
        function loopLinkDevices() {
            loopLinkDevicesTimer = setTimeout(function(){
                wdGoogleSignIn.getDevices().then(function(list){
                    wdGoogleSignIn.getAccount().then(function(data){
                        $scope.accountEmail = data;
                    });
                    if(list.length === 0){
                        loopLinkDevices();
                    }else{
                        $scope.submit(list[0]);
                    }
                },
                function(){
                    wdGoogleSignIn.setToken().then(function(){
                        loopLinkDevices();
                    });
                });
            },3000);
        }

        function stopLoopLinkDevices () {
            clearTimeout(loopLinkDevicesTimer);
        }

        $scope.googleSigIn = function () {
            GA('user_sign_in:click_sign_in:google_sign_in');
            wdGoogleSignIn.setToken();
        };

        $scope.connectPhone = function (item) {
            item['loading'] = true;
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
                $window.localStorage.removeItem('googleToken');
                $window.location.reload();
            },function(){
                $scope.googleSignOut();
            });
        };

        $scope.showConnectNewPhone = function () {
            $scope.isShowChangeDevicesPop = true;
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
            if(!!item.ip){
                $scope.submit(item);
            }else{
                wdGoogleSignIn.getDevices().then(function(list){
                    $log.log(list);
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
                    wdGoogleSignIn.setToken();
                });
            }

        }else{
            googleInit();
        }

        $scope.$on('$destroy', function() {
            stopLoopLinkDevices();
            stopLoopGetDevices();
        });

    }]);
});
