/*global Modernizr*/
define([
    'angular',
    'auth/services/token',
    'auth/services/googleSignIn'
    // 'auth/directives/googleSignInBtn'
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
    // .directive('googleSignInBtn',googleSignInBtn)
    .controller('portalController', ['$scope', '$location', '$http', 'wdDev', '$route', '$timeout', 'wdAuthToken', 'wdKeeper', 'GA', 'wdAlert', 'wdBrowser', '$rootScope', 'wdGoogleSignIn', '$log', '$window',
        function($scope, $location, $http, wdDev, $route, $timeout, wdAuthToken, wdKeeper, GA, wdAlert, wdBrowser, $rootScope, wdGoogleSignIn, $log, $window) {

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

        //显示的账号的名称
        $scope.accountEmail = 'your account';

        function loopSetToken() {
            if ( typeof(gapi) === 'undefined' || typeof(gapi.auth) === 'undefined' || typeof(gapi.auth.authorize) === 'undefined' ){
                setTimeout(loopSetToken,16);
            }else{
                wdGoogleSignIn.setToken(true);
            }
        }

        //检测是否曾经登陆过
        if(!!window.localStorage.getItem('googleToken')){
            $scope.isLoadingDevices = true;
            loopSetToken();
        }else{
            $scope.isLoadingDevices = false;
        }

        //轮询的timer
        var loopGetDevicesTimer;
        var loopLinkDevicesTimer;

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
            $scope.isLoadingDevices = true;
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
                    $scope.isLoadingDevices = true;
                    loopGetDevices();

                    //TODO: 应该是退到设备列表页面

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
        else if ($scope.auth.ip) {
            $timeout(function() {
                $scope.submit($scope.auth);
            }, 0);
        }else if (!$scope.auth.ip){
            $scope.autoAuth = false;
        }

        // function pingDevice ( deviceData ) {
        //     var ip =  deviceData['ip'];
        //     var authCode = deviceData['authcode'];
        //     $http({
        //         method: 'get',
        //         url: 'http://'+ip+':10208/api/v1/directive/auth',
        //         timeout: 10000,
        //         params: {
        //             authcode: authCode,
        //             'client_time': (new Date()).getTime(),
        //             'client_name': 'Browser',
        //             'client_type': 3
        //         }
        //     })
        //     .success(function(response) {
        //     })
        //     .error(function(reason, status) {

        //     });
        // }

        function googleInit() {
            wdGoogleSignIn.init().then(function(list){
                $log.log('googleInit');
                if( typeof list !== 'undefined' ){
                    $log.log(list);
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
                $scope.googleSigOut();
            });
        }

        //轮询获取设备列表
        function loopGetDevices() {
            loopGetDevicesTimer = setTimeout(function(){
                wdGoogleSignIn.getDevices().then(function(list){
                    $scope.deviceNum = list.length;
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
            },10000);
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
            wdGoogleSignIn.setToken();
        };

        $scope.connectPhone = function (item) {
            $scope.isLoadingDevices = true;
            $scope.submit(item);
        };

        $scope.googleSigOut = function () {
            $scope.isLoadingDevices = true;
            stopLoopLinkDevices();
            stopLoopGetDevices();
            wdGoogleSignIn.signOut().then(function(){
                // wdGoogleSignIn.render();
                // googleInit();
                // $scope.deviceNum = -1;
                // $scope.isLoadingDevices = false;
                window.location.reload();
            },function(){
                $scope.googleSigOut();
            });
        };

        $scope.showSignInPhone = function () {
            $scope.deviceNum = 0;
        };

        // 当用户从其他设备中退出到当前页面时
        if( wdGoogleSignIn.getIsLogin() ){
            $scope.isLoadingDevices = true;

            //用户是想要切换到另一个设备
            var item = wdGoogleSignIn.currentDevice();
            if(!!item.status && item.status === 'signout'){
                $scope.googleSigOut();
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
