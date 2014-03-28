define([
        'underscore'
    ], function(
        _
    ) {
'use strict';
return [function() {
return {

scope: true,
controller: [
        '$scope', 'GA', 'wdAlert', 'wdDev',  '$route', '$rootScope', '$filter', 'wdDownload',
function($scope,   GA,   wdAlert,   wdDev,    $route,   $rootScope,   $filter,   wdDownload) {
    // Selection logic.
    $scope.lastSelectedPhoto = null;

    $scope.selectedPhotos = function() {
        return $scope.photos.filter($scope.isSelected);
    };
    $scope.isSelected = function(photo) {
        return !!photo.selected;
    };
    $scope.deselectAll = function() {
        $scope.photos.forEach(function(p) {
            p.selected = false;
        });
        $scope.lastSelectedPhoto = null;
        GA('photos:toolbar:deselect_all');
    };
    $scope.select = function(photo, shiftKey) {
        photo.selected = !photo.selected;
        if (photo.selected) {
            if (shiftKey) {
                GA('photos:photo:shift_select');
            }
            else {
                GA('photos:photo:select');
            }
        }
        else {
            GA('photos:photo:deselect');
        }

        if (photo.selected && shiftKey) {
            var startIndex = Math.max($scope.photos.indexOf($scope.lastSelectedPhoto), 0);
            var stopIndex = $scope.photos.indexOf(photo);
            $scope.photos.slice(Math.min(startIndex, stopIndex), Math.max(startIndex, stopIndex) + 1).forEach(function(p) {
                p.selected = true;
            });
        }
        if (!photo.selected && photo === $scope.lastSelectedPhoto) {
            var index = $scope.photos.indexOf(photo);
            var cursor = null;
            var i, p;
            for (i = index + 1; i < $scope.photos.length; i += 1) {
                p = $scope.photos[i];
                if (p.selected) {
                    cursor = p;
                    break;
                }
            }
            if (!cursor) {
                for (i = index - 1; i >= 0; i -= 1) {
                    p = $scope.photos[i];
                    if (p.selected) {
                        cursor = p;
                        break;
                    }
                }
            }
            $scope.lastSelectedPhoto = cursor;
        }
        if (photo.selected) {
            $scope.lastSelectedPhoto = photo;
        }
    };

    // Removal logic, delegate real removal to $scope.removePhotos.
    $scope.deleteSelected = function() {
        return confirm().then(function() {
            $scope.removePhotos($scope.selectedPhotos());
        });
    };

    $scope.downloadSelected = function() {
        var size = 0;
        _.each($scope.selectedPhotos(), function(item) {
            size += item.size;
        });

        if (wdDev.isWapRemoteConnection() && size >= wdDev.getRemoteConnectionData('limitSize')) {
            wdAlert.confirm(
                $scope.$root.DICT.photos.WAP_CONNECTION_DOWNLOAD_COMFIRM.TITLE,
                $scope.$root.DICT.photos.WAP_CONNECTION_DOWNLOAD_COMFIRM.CONTENT.replace('$$$$', $filter('sizeFormat')(size)),
                $scope.$root.DICT.portal.WAP_CONNECTION_DOWNLOAD_COMFIRM.OK,
                $scope.$root.DICT.portal.WAP_CONNECTION_DOWNLOAD_COMFIRM.CANCEL
            ).then(function() {
                download();
            });
        } else {
            download();
        }

    };

    function download() {
        var form = document.createElement('form');
        form.method = 'POST';
        form.action = wdDev.getServer() + '/static/photos';
        form.action = wdDev.wrapRemoteConnectionURL(form.action);
        form.target = wdDownload.createTarget();
        var path = document.createElement('input');
        path.type = 'text';
        path.name = 'ids';
        path.value = $scope.selectedPhotos().map(function(p) { return p.id; }).join(',');
        form.appendChild(path);
        form.style.display = 'none';
        document.body.appendChild(form);
        form.submit();
    }

    // Utils
    function confirm() {
        return wdAlert.confirm(
            $scope.$root.DICT.photos.CONFIRM_DELETE_TITLE,
            $scope.$root.DICT.photos.CONFIRM_DELETE_CONTENT,
            $scope.$root.DICT.photos.CONFIRM_DELETE_OK,
            $scope.$root.DICT.photos.CONFIRM_DELETE_CANCEL
        );
    }
}],
link: function() {
}

};
}];
});
