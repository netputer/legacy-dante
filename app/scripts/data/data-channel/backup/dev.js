define([
    'underscore'
    ], function(
    _
    ) {
    'use strict';
    return ['$http', function($http) {
        var DEFAULT_PORT = '80';
        var ip;
        var port = '80';
        var meta = {};

        // $resouce service support :name in url as parameter.
        // If target url need : for presenting port, it should be encoded.
        function encodeServer(server) {
            return server.replace(':', '\\:');
        }
        var api = {
            setServer: function(newIP, newPort) {
                ip = newIP;
                port = newPort;
            },

            getServer: function() {
                return ip ? ('//' + ip + ':' + (port || DEFAULT_PORT )) : '';
            },

            setMeta: function(data) {
                meta = data;
            },
            
            getMetaData: function(key) {
                return meta[key];
            },

            wrapURL: function(url, forResource) {
                var server = api.getServer();
                if (forResource) {
                    server = encodeServer(server);
                }
                
                var prefix = '/api/v2/' + Date.now();
                
                // for get string id
                url += (url.indexOf('?') === -1 ? '?' : '&');
                url += 'client=web';

                return server + prefix + url;
            },

            http: function(parameters) {
                parameters.url = api.wrapURL(parameters.url);

                return $http(parameters);
            }
        };

        createShortMethods('get', 'delete', 'head', 'jsonp');
        createShortMethodsWithData('post', 'put');

        function createShortMethods(names) {
            _.each(arguments, function(name) {
                api.http[name] = function(url, config) {
                    url = api.wrapURL(url);

                    return $http(_.extend(config || {}, {
                        method: name,
                        url: url
                    }));
                };
            });
        }


        function createShortMethodsWithData(name) {
            _.each(arguments, function(name) {
                api.http[name] = function(url, data, config) {
                    url = api.wrapURL(url);

                    return $http(_.extend(config || {}, {
                        method: name,
                        url: url,
                        data: data
                    }));
                };
            });
        }


        return api;
    }];
});