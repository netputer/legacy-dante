define([
        'underscore'
    ], function(
        _
    ) {
'use strict';
return function() {
    var DEFAULT_DEVICE_PORT = 10208;
    var ip = '';
    var port = '';
    var meta = {};
    var WAKE_UP_URL = 'http://lb.snappea.com/wakeup';
    var remoteConnectionData;
    var tryRequestWithRemote = false;

    // $resouce service support :name in url as parameter.
    // If target url need : for presenting port, it should be encoded.
    function encodeServer(server) {
        return server.replace(':', '\\:');
    }

    var self = this;
    self.getIP = function() {
        return ip;
    };
    self.getServer = function() {
        return ip ? ('//' + ip + ':' + (port || DEFAULT_DEVICE_PORT )) : '';
    };
    self.setServer = function(newIP, newPort) {
        ip = newIP;
        port = newPort;
    };
    self.getMetaData = function(key) {
        return meta[key];
    };
    self.setMetaData = function(data) {
        meta = data;
    };
    self.setRemoteConnectionData = function(data) {
        if (!remoteConnectionData) {
            remoteConnectionData = data;
        } else {
            _.extend(remoteConnectionData, data);
        }
    };
    self.getRemoteConnectionData = function(key) {
        var val;
        if (key) {
            if (remoteConnectionData) {
                val = remoteConnectionData[key];
            } else if (tryRequestWithRemote) {
                val = tryRequestWithRemote[key];
            }
        } else {
            val = remoteConnectionData;
        }
        return val;
    };
    self.closeRemoteConnection = function() {
        remoteConnectionData = null;
    };
    self.$get = ['$window', '$q', '$rootScope', '$timeout',
        function( $window,   $q,   $rootScope,   $timeout) {
        var devAPIs = {
            getIP: self.getIP,
            setServer: self.setServer,
            getServer: self.getServer,
            setMetaData: self.setMetaData,
            getMetaData: self.getMetaData,
            wrapPrefixURL: function(url, forResource) {
                if (url.indexOf('http://') === 0) {
                    return url;
                }

                var server = self.getServer();
                if (forResource) {
                    server = encodeServer(server);
                }
                
                var prefix = '/api/v1';
                if ($rootScope.READ_ONLY_FLAG) {
                    prefix = '/api/v2/' + new Date().getTime();

                    // for get string id
                    url += (url.indexOf('?') === -1 ? '?' : '&');
                    url += 'client=web';
                }

                return server + prefix + url;
            },
            wrapURL: function(url, forResource) {
                return devAPIs.wrapRemoteConnectionURL(devAPIs.wrapPrefixURL(url, forResource));
            },
            wrapRemoteConnectionURL: function(url, type) {
                if (devAPIs.isRemoteConnection() || tryRequestWithRemote) {
                    var proxyUrl;
                    switch(type) {
                        case 'upload':
                            proxyUrl = self.getRemoteConnectionData('httpUploadUrl');
                            break;
                        case 'image':
                            proxyUrl = self.getRemoteConnectionData('httpDownloadUrl');
                            break;
                        default:
                            proxyUrl = self.getRemoteConnectionData('httpProxyUrl');
                    }

                    url = proxyUrl + '?token=' + self.getRemoteConnectionData('token') + '&originUrl=' + encodeURIComponent(url);
                } 
                return url;
            },
            getWakeUpUrl: function() {
                return WAKE_UP_URL;
            },
            closeRemoteConnection: function() {
                self.closeRemoteConnection();
                $rootScope.remoteConnection = null;
            },
            setRemoteConnectionData: function(data) {
                self.setRemoteConnectionData(data);
                $rootScope.remoteConnection = self.getRemoteConnectionData();
            },
            getRemoteConnectionData: function(key) {
                return self.getRemoteConnectionData(key);
            },
            isRemoteConnection: function() {
                return !!self.getRemoteConnectionData();
            },
            isWapRemoteConnection: function() {
                return !!self.getRemoteConnectionData() && !!self.getRemoteConnectionData('wap');
            },
            setRequestWithRemote:function(data) {
                tryRequestWithRemote = data;
            },
            getRequestWithRemote: function() {
                return tryRequestWithRemote;
            },
            getSocketServer: function() {
                var IP;
                if (devAPIs.isRemoteConnection()) {
                    IP = self.getRemoteConnectionData('socketIOUrl');
                } else {
                    IP = ip ? ('//' + ip + ':' + 10209) : '';
                }

                return IP;
            },
            query: function(key) {
                var queries = $window.location.search.slice(1).split('&');
                var params = {};
                _.each(queries, function(query) {
                    query = query.split('=');
                    params[decodeURIComponent(query[0])] = decodeURIComponent(query[1]);
                });
                return key ? params[key] : params;
            },
            ping: function( host, port ) {
                port = port || DEFAULT_DEVICE_PORT;
                var defer = $q.defer();
                var image = new Image();
                var timeout = null;
                var url = '//' + host + ':' + port;

                url += '?_=' + Date.now();
                image.onload = image.onerror = function(e) {
                    $rootScope.$apply(function() {
                        $timeout.cancel(timeout);
                        if (e.type === 'error' &&
                            $window.navigator.onLine === false) {
                            defer.reject('offline');
                        }
                        else {
                            defer.resolve();
                        }
                    });
                };

                image.src = url;

                timeout = $timeout(function() {
                    defer.reject('timeout');
                    image.src = null;
                }, 1500);

                return defer.promise;
            }
        };

        return devAPIs;
    }];
};
});
