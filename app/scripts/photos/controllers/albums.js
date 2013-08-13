define([
        'underscore'
    ], function(
        _
    ) {
'use strict';

return ['$scope', 'GA', 'wdpAlbums', '$route', 'wdpPhotos', function($scope, GA, wdpAlbums, $route, wdpPhotos) {
    $scope.albumDisabledOkButton = false;

    $scope.updateAlbums = function() {
        $scope.albumDisabledOkButton = true;

        wdpAlbums.updateData($scope.albumList).then(function() {
            $scope.albumDisabledOkButton = false;
            $scope.hideAlbumSettings();
            wdpPhotos.clear();
            $route.reload();
        }, function() {
            $scope.albumDisabledOkButton = false;
            // update albums error
        });
    };

    $scope.selectAlbum = function(album, selected) {
        album.visible = selected;
    };

}];

});
