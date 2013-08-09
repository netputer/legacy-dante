define([
        'underscore'
    ], function(
        _
    ) {
'use strict';

return ['$scope', 'GA', 'wdpAlbums', '$route', 'wdpPhotos', function($scope, GA, wdpAlbums, $route, wdpPhotos) {
    $scope.updateAlbums = function() {
        wdpAlbums.updateData($scope.albumList).then(function() {
            $scope.hideAlbumSettings();
            wdpPhotos.clear();
            $route.reload();
        }, function() {
            // update albums error
        });
    };

    $scope.selectAlbum = function(album, selected) {
        album.visible = selected;
    };

}];

});
