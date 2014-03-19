define([
    'underscore'
    ], function(
    _
    ) {
    'use strict';
    return ['$http', '$resource', 'wdEventEmitter',
    function($http,   $resource,   wdEventEmitter) {

        function Photo() {
            this.collection = [];

            wdEventEmitter(this);
        }

        _.extend(Photo.prototype, {
            getAlbums : function() {
                return $http.get('/resource/albums');
            },

            updateAlbums : function(data) {
                return $http.put('/resource/albums', data);
            },

            getById: function(id) {
                return _.find(this.collection, function(p) {
                    return p.id === id;
                });
            },

            merge: function(photos) {
                photos = [].concat(photos);
                photos = _.sortBy(this.collection.concat(photos), function(photo) {
                    return 'date_added' in photo ? -photo.date_added : Number.NEGATIVE_INFINITY;
                });
                this.collection = _.uniq(photos, function(photo) {
                    return photo.id;
                });
            },

            clear: function() {
                this.collection = [];
            },

            service: function() {
                return $resource('/resource/photos/:id', {id: '@id'});
            }

        });

        return Photo;

    }];
});