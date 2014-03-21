define([
    'angular',
    'auth/main',
    'photos/main',
    'text!templates/auth/international.html',
    'text!templates/auth/cloudData.html',
    'text!templates/photos/gallery.html',
    'text!templates/contacts/index.html',
    'text!templates/applications/index.html',
    'text!templates/messages/conversations.html',
    'common/main',
    'common/language',
    'messages/main',
    'contacts/main',
    'applications/main',
    'ui/main',
    'jquery'
], function(
    angular,
    auth,
    photos,
    InternationalTemplate,
    cloudDataTemplate,
    PhotosTemplate,
    ContactsTemplate,
    ApplicationsTemplate,
    MessagesTemplate,
    common,
    language,
    messages,
    contacts,
    applications,
    ui,
    jQuery
) {
'use strict';

jQuery('.no-support-placeholder').remove();

var READ_ONLY_FLAG = true;
//>>excludeStart("readonly", pragmas.cloudBased);
READ_ONLY_FLAG = false;
//>>excludeEnd("readonly");
//>>includeStart("debug", pragmas.debug);
READ_ONLY_FLAG = !!window.localStorage.getItem('WD_READ_ONLY_FLAG') || READ_ONLY_FLAG;
//>>includeEnd("debug");

READ_ONLY_FLAG = true;
angular.module('wdApp', ['ng', 'ngRoute', 'ngSanitize', 'wdCommon', 'wd.ui', 'wdAuth', 'wdPhotos', 'wdLanguage', 'wdMessages', 'wdContacts','wdApplications'])
    .config([   '$routeProvider', '$httpProvider',
        function($routeProvider,   $httpProvider) {

        // Prevent CORS error for accept-headers...
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

        // Used for filter route changing which need auth.
        var validateToken = ['$q', 'wdDevice', '$location',
            function($q, wdDevice, $location) {

            if (wdDevice.valid()) {
                return true;
            }
            else {
                // Auth invalid, jump to portal
                $location.url('/portal?ref=' + encodeURIComponent($location.url()));
                return $q.reject('Authentication failed.');
            }
        }];

        var reflectNavbar = function(moduleName) {
            return [function() {
                return moduleName;
            }];
        };

        var minVersionRequirement = function(versionCode) {
            return ['wdDev', function(wdDev) {
                return wdDev.getMetaData('version_code') >= versionCode;
            }];
        };

        // Routers configurations.
        $routeProvider.when('/portal/:help', {
            redirectTo: '/portal'
        });

        if (READ_ONLY_FLAG) {
            $routeProvider.when('/portal', {
                template: cloudDataTemplate,
                controller: 'cloudDataController'
            });
        }
        else {
            $routeProvider.when('/portal', {
                template: InternationalTemplate,
                controller: 'internationalController'
            });
        }
        $routeProvider.when('/devices', {
            resolve: {
                signout: ['wdDevice', '$q', 'wdGoogleSignIn', function(wdDevice, $q, wdGoogleSignIn ) {
                    wdDevice.signout();
                    wdGoogleSignIn.setForceShowDevices(true);
                    return $q.reject('signout');
                }]
            }
        });
        $routeProvider.when('/signout', {
            redirectTo: '/devices'
        });
        $routeProvider.when('/extension-signout', {
            resolve: {
                signout: ['wdGoogleSignIn', '$q', 'wdAlert', '$rootScope', function(wdGoogleSignIn, $q, wdAlert ,$rootScope) {
                    wdAlert.confirm(
                        $rootScope.DICT.app.EXTENSION_SIGN_OUT.title,
                        $rootScope.DICT.app.EXTENSION_SIGN_OUT.content,
                        $rootScope.DICT.app.EXTENSION_SIGN_OUT.button_ok,
                        $rootScope.DICT.app.EXTENSION_SIGN_OUT.button_cancel
                    ).then(function(){
                        wdGoogleSignIn.signout();
                    },function(){

                    });
                }]
            },
            redirectTo: '/portal'
        });
        $routeProvider.when('/', {
            redirectTo: '/' + (localStorage.getItem('lastModule') || 'photos')
        });
        $routeProvider.when('/photos', {
            template: PhotosTemplate,
            controller: 'galleryController',
            resolve: {
                auth: validateToken,
                nav: reflectNavbar('photos'),
                versionSupport: minVersionRequirement(3896)
            },
            reloadOnSearch: false
        });
        $routeProvider.when('/messages', {
            template: MessagesTemplate,
            controller: 'wdmConversationController',
            resolve: {
                auth: validateToken,
                nav: reflectNavbar('messages'),
                versionSupport: minVersionRequirement(3896)
            },
            reloadOnSearch: true
        });
        $routeProvider.when('/contacts', {
            template: ContactsTemplate,
            controller: 'ContactsCtrl',
            resolve: {
                auth: validateToken,
                nav: reflectNavbar('contacts'),
                versionSupport: minVersionRequirement(3896)
            },
            reloadOnSearch: false
        });
        $routeProvider.when('/applications', {
            template: ApplicationsTemplate,
            controller: 'ApplicationsCtrl',
            resolve: {
                auth: validateToken,
                nav: reflectNavbar('applications'),
                versionSupport: minVersionRequirement(3896)
            },
            reloadOnSearch: false
        });
        $routeProvider.otherwise({
            redirectTo: '/portal'
        });

        // Global exception handling.
        $httpProvider.interceptors.push(['wdDev', '$rootScope', '$q', '$log', '$injector', '$window', 'wdSocket',
            function(wdDev, $rootScope, $q, $log, $injector, $window, wdSocket) {
            return {
                request: function(config) {
                    // Using realtime data source url.
                    if (config.url && !/^(http|https):/.test(config.url)) {
                        config.url = wdDev.wrapURL(config.url);
                    }
                    // Global timeout
                    if (angular.isUndefined(config.timeout)) {
                        config.timeout = 20 * 1000;
                    }
                    // By default, all request using withCredentials to support cookies in CORS.
                    if (angular.isUndefined(config.withCredentials)) {
                        config.withCredentials = true;
                    }
                    pushActiveRequest($rootScope);
                    return config;
                },
                response: function success(response) {
                    $log.log(response.config.url, response.status);
                    popActiveRequest($rootScope);
                    return response;
                },
                responseError: function error(rejection) {
                    $log.warn(rejection.config.url, rejection.status);
                    popActiveRequest($rootScope);
                    // 423 Locked
                    if ($rootScope.READ_ONLY_FLAG && rejection.status === 423) {
                        $window.alert($rootScope.DICT.app.ACCOUNT_LOCKED);
                        $window.location = 'https://account.wandoujia.com/web/forgetpassword?callback=' + encodeURIComponent($window.location.href);
                    }
                    // If auth error, always signout.
                    // 401 for auth invalid, 0 for server no response.

                    if (!rejection.config.disableErrorControl &&
                        (rejection.status === 401 /*|| response.status === 0 */)) {
                        $injector.invoke(['wdDevice', function(wdDevice){
                            wdDevice.signout();
                        }]);
                    }
                    return $q.reject(rejection);
                }
            };
        }]);

        var activeRequest = 0;
        function pushActiveRequest($scope) {
            activeRequest += 1;
            if (activeRequest === 1) {
                $scope.$broadcast('ajaxStart');
            }
        }
        function popActiveRequest($scope) {
            activeRequest -= 1;
            if (activeRequest === 0) {
                $scope.$broadcast('ajaxStop');
            }
        }
    }])
    .run([      '$window', '$rootScope', 'wdKeeper', 'GA', 'wdLanguageEnvironment', 'wdSocket',
            'wdTitleNotification', 'wdDev', '$q', '$document', '$route', 'wdDatabase', 'wdWindowFocus', 'wdmConversations', 'wdReminder', 'wdDevice',
        function($window,   $rootScope,   wdKeeper,   GA,   wdLanguageEnvironment,   wdSocket,
             wdTitleNotification,   wdDev,   $q,   $document,   $route,   wdDatabase,   wdWindowFocus,   wdmConversations,   wdReminder,   wdDevice) {
        // Tip users when leaving.
        // 提醒用户是否重新加载数据
        // $window.onbeforeunload = function () {
        //     return wdKeeper.getTip();
        // };

        $rootScope.READ_ONLY_FLAG = READ_ONLY_FLAG;

        (function(keeper) {
            $rootScope.$on('ajaxStart', function() {
                keeper = wdKeeper.push($rootScope.DICT.app.UNLOAD_NETWORK_TIP);
            });
            $rootScope.$on('ajaxStop',  function() {
                keeper.done();
            });
        })();

        // GA support
        $rootScope.GA = GA;

        // i18n
        wdLanguageEnvironment.apply();

        $rootScope.applyLanguage = function(language) {
            wdLanguageEnvironment.apply(language);
        };

        $rootScope.notifyNewMessage = function() {
            wdTitleNotification.notify($rootScope.DICT.app.MESSAGE_NOTIFICATION_TITLE);
        };
        $rootScope.restoreTitle = function() {
            wdTitleNotification.restore();
        };

        $rootScope.$on('signin', function() {
            if (!$rootScope.READ_ONLY_FLAG) {
                wdSocket.connect();
                wdDatabase.open(wdDev.getMetaData('phone_udid'));
                // SDK version equals 19 means SDK 4.4
                $rootScope.SDK_19 = wdDev.getMetaData('SDK_version') === 19 ? true : false;
                $rootScope.$watch('remoteConnection', function(newVal, oldVal) {
                    if (newVal && !newVal.wap) {
                        wdReminder.open(
                            $rootScope.DICT.app.REMOTE_CONNECTION_REMIND.TITLE,
                            $rootScope.DICT.app.REMOTE_CONNECTION_REMIND.CONTENT,
                            $rootScope.DICT.app.REMOTE_CONNECTION_REMIND.OK,
                            {
                                link: $rootScope.DICT.app.REMOTE_CONNECTION_REMIND.HELP_LINK,
                                text: $rootScope.DICT.app.REMOTE_CONNECTION_REMIND.HELP_TEXT
                            } 
                        ); 
                    }
                });
                remindSocketDisconnect();
            }
            GA('login:phone_model:' + wdDev.getMetaData('phone_model'));
        });

        $rootScope.$on('signout', function() {
            if (!$rootScope.READ_ONLY_FLAG) {
                wdSocket.close();
                wdDatabase.close();
                wdTitleNotification.restore();
                wdDev.closeRemoteConnection();
                wdReminder.close();
                $rootScope.$broadcast('sidebar:close');
            }
        });

        $rootScope.remoteConnectionLoadPicture = function() {
            var tempObj = {};
            tempObj.loadPictures = true;
            wdDev.setRemoteConnectionData(tempObj);

            $rootScope.closingWDTip = true;
        };

        wdSocket.on('refresh', function() {
            $route.reload();
        });

        $rootScope.globalControl = function(e) {
            if (!jQuery(e.target).parents('.sidebar').length && !jQuery(e.target).parents('.nav-settings').length) {
                $rootScope.showSidebar = false;
            }
        };

        $window.onbeforeunload = function() {
            wdDatabase.close();
        };

        function remindSocketDisconnect() {
            var disconnected = false;
            var connectTimer = null;
            var INIT_DELAY_TIME = 10;
            var delayTime = INIT_DELAY_TIME;
            var firstTime = true;

            var refreshDelayTime = function() {
                if (firstTime) {
                    connectSocket();
                    firstTime = false;
                } else {
                    delayTime = INIT_DELAY_TIME;
                    showDisconnectRemind(true);
                    connectTimer = setInterval(function() {
                        $rootScope.$apply(function() {
                            delayTime -= 1;
                            showDisconnectRemind(true);
                            if (delayTime <= 0) {
                                connectSocket();
                            }
                        });
                    }, 1000);
                }
            };

            var clearConnectTimer = function() {
                if (connectTimer) {
                    clearInterval(connectTimer);
                    connectTimer = null;
                }
            };

            var showDisconnectRemind = function(countdown) {
                var tip = $rootScope.DICT.app.SOCKET_DISCONNECT_REMIND.TIP;
                tip += countdown ? $rootScope.DICT.app.SOCKET_DISCONNECT_REMIND.TIP_TIMER_END : $rootScope.DICT.app.SOCKET_DISCONNECT_REMIND.TIP_END;
                wdReminder.open(
                    $rootScope.DICT.app.SOCKET_DISCONNECT_REMIND.TITLE,
                    tip.replace('$$$$', delayTime),
                    $rootScope.DICT.app.SOCKET_DISCONNECT_REMIND.OK,
                    {
                        link: $rootScope.DICT.app.SOCKET_DISCONNECT_REMIND.LINK,
                        text: $rootScope.DICT.app.SOCKET_DISCONNECT_REMIND.LINK_TEXT
                    },
                    false,
                    !countdown
                ).then(function() {
                    connectSocket();
                }, function() {
                    closeDisconnectRemind();
                });
            };

            var closeDisconnectRemind = function() {
                wdReminder.close();
                clearConnectTimer();
                firstTime = true;
            };

            var connectSocket = function() {
                showDisconnectRemind(false);
                clearConnectTimer();

                wdSocket.refreshDeviceAndConnect().then(function() {
                    closeDisconnectRemind();
                }, function() {
                    refreshDelayTime();
                });
            };

            wdSocket.on('socket:disconnected', function(forceRefreshRetyTimes) {
                disconnected = true;
                if (!connectTimer || forceRefreshRetyTimes) {
                    refreshDelayTime();
                }
            });

            wdSocket.on('socket:connected', function() {
                if (disconnected) {
                    closeDisconnectRemind();
                }
            });

            $rootScope.$on('signout', function() {
                closeDisconnectRemind();
            });
        }

        wdWindowFocus.initialize();
        wdmConversations.initialize();

    }]);

window.facebookInitDefer = jQuery.Deferred();

if (!READ_ONLY_FLAG) {
    jQuery(window).one('load', function() {
        jQuery.ajax({
            dataType: 'script',
            cache: true,
            url: 'http://connect.facebook.net/en_UK/all.js'
        }).done(function(){
            window.FB.init({
                appId: '265004820250785'
            });
            window.facebookInitDefer.resolve(window.FB);
        });
    });

}

var GA_ID = READ_ONLY_FLAG ? 'UA-15790641-1' : 'UA-15790641-36';
var GA_SRC = READ_ONLY_FLAG ? 'http://s.wdjimg.com/googleanalytics/ga.js' : (('https:'===location.protocol?'//ssl':'//www')+'.google-analytics.com/ga.js');

window._gaq=[['_setAccount', GA_ID],['_trackPageview']];
(function(d,t){
    var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
    g.src=GA_SRC;
    s.parentNode.insertBefore(g,s);
}(document,'script'));

angular.bootstrap(document, ['wdApp']);

(function() {})(common, language, photos, auth, messages, contacts);

});
