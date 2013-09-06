define([
        'underscore'
    ], function(
        _
    ) {
'use strict';
return function() {
    var ip = '';
    var port = '';
    var meta = {};

    // $resouce service support :name in url as parameter.
    // If target url need : for presenting port, it should be encoded.
    function encodeServer(server) {
        return server.replace(':', '\\:');
    }

    var self = this;
    self.getSocketServer = function() {
        return ip ? ('//' + ip + ':' + 10209) : '';
    };
    self.getServer = function() {
        return ip ? ('//' + ip + ':' + (port || 10208)) : '';
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
    self.getAPIPrefix = function() {
        return '/api/v1';
    };
    self.wrapURL = function(url, forResource) {
        var server = self.getServer();
        if (forResource) {
            server = encodeServer(server);
        }
        var prefix = self.getAPIPrefix();
        return server + prefix + url;
    };

    self.$get = ['$window', '$q', '$rootScope', '$timeout',
        function( $window,   $q,   $rootScope,   $timeout) {
        return {
            wrapURL: self.wrapURL,
            setServer: self.setServer,
            getServer: self.getServer,
            setMetaData: self.setMetaData,
            getMetaData: self.getMetaData,
            getSocketServer: self.getSocketServer,
            query: function(key) {
                var queries = $window.location.search.slice(1).split('&');
                var params = {};
                _.each(queries, function(query) {
                    query = query.split('=');
                    params[decodeURIComponent(query[0])] = decodeURIComponent(query[1]);
                });
                return key ? params[key] : params;
            },
            ping: function(url) {
                var defer = $q.defer();
                var image = new Image();
                var timeout = null;

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
            },
            pingServer: function() {
                return this.ping(this.getServer());
            }
        };
    }];
};
});
