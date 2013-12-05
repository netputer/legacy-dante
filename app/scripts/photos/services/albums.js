define([
    'jquery'
], function(
    $
) {
    'use strict';

    return ['$q', '$http', '$rootScope', 'GA',
        function($q, $http, $rootScope, GA) {
            

            var albums = {
                getData : function() {
                    return $http.get('/resource/albums');
                },

                updateData : function(data) {
                    return $http.put('/resource/albums', data);
                }
            };

            return albums;
        }
    ];
});