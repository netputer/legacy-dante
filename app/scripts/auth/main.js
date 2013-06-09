/*global Modernizr*/
define([
    'angular',
    'auth/services/token',
    'auth/services/googleSignIn'
], function(
    angular,
    authToken,
    googleSignIn
) {
'use strict';

angular.module('wdAuth', ['wdCommon'])
    .provider('wdAuthToken', authToken)
    .factory('wdcGoogleSignIn',googleSignIn)
    .controller('portalController', ['$scope', '$location', '$http', 'wdDev', '$route', '$timeout', 'wdAuthToken', 'wdKeeper', 'GA', 'wdAlert', 'wdBrowser', '$rootScope', 'wdcGoogleSignIn',
        function($scope, $location, $http, wdDev, $route, $timeout, wdAuthToken, wdKeeper, GA, wdAlert, wdBrowser, $rootScope, wdcGoogleSignIn) {

        $scope.isSupport = Modernizr.cors && Modernizr.websockets;
        $scope.isSafari = wdBrowser.safari;
        $scope.auth = wdDev.query('ac') || wdAuthToken.getToken() || '';
        $scope.autoAuth = !!$scope.auth;
        $scope.buttonText = $scope.$root.DICT.portal.SIGN_IN;
        $scope.error = '';
        $scope.state = 'standby';
        $scope.showHelp = false;

        //设备的数量
        $scope.deviceNum = -1;

        //设备列表
        $scope.devicesList = [];
        $scope.isLoadingAuth = true;
        $scope.isLoadingDevices = false;
        $scope.accountEmail = '';

        var acFromQuery = !!wdDev.query('ac');
        var acFromInput = false;
        var acFromCache = !!wdAuthToken.getToken();

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
            deviceData = deviceData || wdAuthToken.getToken();
            var authCode = deviceData['authcode'];
            // if (!authCode) {
            //     GA('login:enter_authcode:empty');
            //     return;
            // }
            if ($scope.autoAuth) {
                GA('login:auto');
            }
            else {
                acFromInput = true;
            }
            // Parse data source.
            //var ip = wdAuthToken.parse(authCode);
            var ip = deviceData['ip'];
            var port = 10208;

            var keeper = null;

            // Valid auth code.
            if (ip) {
                if ($scope.autoAuth) {
                    GA('login:auto_authcode:valid');
                }
                else {
                    GA('login:enter_authcode:valid');
                }
                // Send auth request.
                $scope.state = 'loading';
                wdDev.setServer(ip, port);
                keeper = wdKeeper.push($scope.$root.DICT.portal.KEEPER);
                var timeStart = (new Date()).getTime();
                $scope.isLoadingAuth = false;
                $http({
                    method: 'get',
                    url: '/directive/auth',
                    timeout: 5000,
                    params: {
                        authcode: authCode,
                        'client_time': (new Date()).getTime(),
                        'client_name': 'Browser',
                        'client_type': 3
                    },
                    disableErrorControl: !$scope.autoAuth
                })
                .success(function(response) {
                    wdcGoogleSignIn.currentDevice(deviceData);
                    $scope.isLoadingAuth = false;
                    $scope.isLoadingDevices = false;
                    keeper.done();
                    $scope.state = 'standby';
                    $scope.buttonText = $scope.$root.DICT.portal.AUTH_SUCCESS;
                    // TODO: Maybe expiration?
                    wdAuthToken.setToken(deviceData);
                    wdAuthToken.startSignoutDetection();
                    wdDev.setMetaData(response);
                    $location.url($route.current.params.ref || '/');
                    if (acFromInput) {
                        GA('login:success:user_input');
                    }
                    if (acFromQuery) {
                        GA('login:success:query');
                    }
                    else if (acFromCache) {
                        GA('login:success:cache');
                    }
                    GA('perf:auth_duration:success:' + ((new Date()).getTime() - timeStart));
                    $rootScope.$broadcast('signin');
                })
                .error(function(reason, status) {
                    $scope.isLoadingAuth = false;
                    $scope.isLoadingDevices = false;
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
                    if ($scope.autoAuth) {
                        $route.reload();
                    }

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

                    if (acFromInput) {
                        GA('login:' + action + ':user_input');
                    }
                    else if (acFromQuery) {
                        GA('login:' + action + ':query');
                    }
                    if (acFromCache) {
                        GA('login:' + action + ':cache');
                    }
                    GA('perf:auth_duration:' + action + ':' + ((new Date()).getTime() - timeStart));
                });
            }
            // Invalid auth code.
            else {
                if ($scope.autoAuth) {
                    GA('login:auto_authcode:invalid');
                }
                else {
                    GA('login:enter_authcode:invalid');
                }
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
        else if ($scope.auth.ip) {
            $timeout(function() {
                $scope.submit($scope.auth);
            }, 0);
        }else if (!$scope.auth.ip){
            $scope.autoAuth = false;
        }

        function googleInit() {
            wdcGoogleSignIn.init().then(function(list){
                $scope.isLoadingAuth = false;
                console.log('googleInit');
                if(typeof list !== 'undefined'){
                    wdcGoogleSignIn.getAccount().then(function(data){
                        $scope.accountEmail = data;
                    });
                    console.log(list);
                    $scope.deviceNum = list.length;
                    switch(list.length){
                        case 0:
                            loopLinkDevices();
                        break;
                        case 1:
                            $scope.devicesList = list;
                            $scope.submit(list[0]);
                        break;
                        default:
                            $scope.devicesList = list;
                            loopGetDevices();
                        break;
                    }
                }
                $scope.$apply();
            },function(error){
                console.log('google sigin error');
            });
        }

        //轮询获取设备列表
        function loopGetDevices() {
            setTimeout(function(){
                wdcGoogleSignIn.getDevices().then(function(list){
                    $scope.deviceNum = list.length;
                    switch(list.length){
                        case 0:
                            loopLinkDevices();
                        break;
                        default:
                            $scope.devicesList = list;
                            loopGetDevices();
                        break;
                    }
                },
                function(){
                    loopGetDevices();
                });
            },10000);
        }

        //轮询获取设备列表，如果有一个设备则登录
        function loopLinkDevices() {
            setTimeout(function(){
                wdcGoogleSignIn.getDevices().then(function(list){
                    if(list.length === 0){
                        loopLinkDevices();
                    }else{
                        $scope.submit(list[0]);
                    }
                },
                function(){
                    loopLinkDevices();
                });
            },5000);
        }

        $scope.googleSigIn = function () {
            wdcGoogleSignIn.signIn();
        };

        $scope.connectPhone = function (item) {
            $scope.isLoadingDevices = true;
            $scope.submit(item);
        };

        $scope.googleSigOut = function () {
            $scope.isLoadingDevices = true;
            wdcGoogleSignIn.signOut().then(function(){
                wdcGoogleSignIn.render();
                googleInit();
                $scope.deviceNum = -1;
                $scope.isLoadingDevices = false;
            },function(){
                window.location.reload();
            });
        };

        $scope.showSignInPhone = function () {
            $scope.deviceNum = 0;
        };

        // 当用户从其他设备中退出到当前页面时
        if(!!wdcGoogleSignIn.authResult().access_token){
            $scope.isLoadingAuth = false;
            $scope.isLoadingDevices = true;

            //用户是想要切换到另一个设备
            var item = wdcGoogleSignIn.changeToDevice();
            console.log(item);
            if(!!item.status && item.status === 'signout'){
                $scope.googleSigOut();
                return;
            }

            if(!!item.ip){
                $scope.submit(item);
            }else{
                wdcGoogleSignIn.getDevices().then(function(list){
                    console.log(list);
                    $scope.isLoadingDevices = false;
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
                });
            }

        }else{
            googleInit();
        }

        window.wdcGoogleSignIn = wdcGoogleSignIn;
        window.wdAuthToken = wdAuthToken;


    }]);
});
