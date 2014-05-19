define([], function() {
    'use strict';

    return [
        '$scope', 'wdVirtualDeviceFactory', 'wdAlert', '$timeout',
    function(
         $scope,   wdVirtualDeviceFactory,   wdAlert,   $timeout
    ) {

        var videosService = wdVirtualDeviceFactory.getCurrentDevice().getVideosService();

        videosService.getVideoList()
            .then(function(data) {
                $scope.list = data;
            });

        $scope.showDetailPanel = function(video) {
            $scope.displayMask = true;
            $scope.video = video;
            $timeout(function() {
                $scope.toggleDetailPanel = true;
            }, 20);
        };

        $scope.delete = function(video) {
            $scope.video = video;
            $scope.showDetailPanel(video);
        };

        $scope.download = function(video) {
            $scope.video = video;
            $scope.showDetailPanel(video);
        };

        $scope.closeDetailPanel = function() {
            $scope.toggleDetailPanel = false;

            $timeout(function() {
                $scope.displayMask = false;
            }, 400);
        };

        $scope.deleteVideos = function() {
            return wdAlert.confirm(
                    $scope.$root.DICT.photos.CONFIRM_DELETE_TITLE,
                    $scope.$root.DICT.photos.CONFIRM_DELETE_CONTENT,
                    $scope.$root.DICT.photos.CONFIRM_DELETE_OK,
                    $scope.$root.DICT.photos.CONFIRM_DELETE_CANCEL
                ).then(function() {
                
            });
        };

        $scope.deleteEpisode = function() {

            return wdAlert.confirm(
                    $scope.$root.DICT.photos.CONFIRM_DELETE_TITLE,
                    $scope.$root.DICT.photos.CONFIRM_DELETE_CONTENT,
                    $scope.$root.DICT.photos.CONFIRM_DELETE_OK,
                    $scope.$root.DICT.photos.CONFIRM_DELETE_CANCEL
                ).then(function() {
                
            });
        };
    }];
});