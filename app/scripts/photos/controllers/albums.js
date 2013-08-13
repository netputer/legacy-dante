define([
        'underscore'
    ], function(
        _
    ) {
'use strict';

return ['$scope', 'GA', 'wdpAlbums', '$route', 'wdpPhotos', function($scope, GA, wdpAlbums, $route, wdpPhotos) {
    $scope.disabledOkButton = false;

    $scope.updateAlbums = function() {
        $scope.disabledOkButton = true;

        wdpAlbums.updateData($scope.albumList).then(function() {
            $scope.disabledOkButton = false;
            $scope.hideAlbumSettings();
            wdpPhotos.clear();
            $route.reload();
        }, function() {
            $scope.disabledOkButton = false;
            // update albums error
        });
    };

    $scope.selectAlbum = function(album, selected) {
        album.visible = selected;
    };

}];

});
