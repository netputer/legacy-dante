define([], function() {
    'use strict';
    return [function() {
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

                return server + prefix + url;
            }
        };

        return api;
    }];
});