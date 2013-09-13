define([
        'fineuploader',
        'jquery',
        'underscore'
    ], function(
        fineuploader,
        jQuery,
        _
    ) {
'use strict';
return [    '$q', 'wdDev', 'wdKeeper', 'wdpImageHelper', 'GA', 'wdAlert',
    function($q,   wdDev,   wdKeeper,   wdpImageHelper,   GA,   wdAlert) {
    return {
        link: function(scope, element) {
            var keeper = null;
            var counter = 0;

            var uploader = new fineuploader.FineUploaderBasic({
                button: element[0],
                request: {
                    endpoint: wdDev.wrapURL('/directive/photos/upload')
                },
                validation: {
                    acceptFiles: 'image/*',
                    allowedExtensions: ['jpg', 'jpeg', 'gif', 'png'],
                    stopOnFirstInvalidFile: false
                },
                cors: {
                    expected: true,
                    sendCredentials: true
                },
                messages: {
                    onLeave: scope.$root.DICT.photos.UPLOAD_RELOAD
                },
                callbacks: {
                    onSubmit: function(id) {
                        var file = uploader.getFile(id);
                        var photoPromise = loadLocalPhoto(file);

                        file.defer = jQuery.Deferred();
                        var uploadPromise = file.defer.promise();

                        uploadPromise.cancelUpload = function() {
                            uploader.cancel(id);
                        };
                        uploadPromise.retryUpload = function() {
                            uploader.retry(id);
                        };

                        count();

                        scope.startUpload({
                            photo: photoPromise,
                            upload: uploadPromise
                        });
                    },
                    onProgress: function(id, name, uploadedBytes, totalBytes) {
                        var file = uploader.getFile(id);
                        var percent = Math.round((uploadedBytes / totalBytes) * 100);
                        file.defer.notify({
                            status: 'uploading',
                            percent: percent
                        });
                    },
                    onComplete: function(id, name, response) {
                        var file = uploader.getFile(id);

                        uncount();

                        if (response.success) {
                            file.defer.resolve(response.result);
                            GA('photos:upload:success');
                        }
                        else {
                            file.defer.notify({
                                status: 'failed'
                            });
                            GA('photos:upload:fail_' + response.status);
                        }
                    },
                    onManualRetry: function() {
                        count();
                    },
                    onCancel: function() {
                        uncount();
                    }
                }
            });

            var dnd = new fineuploader.DragAndDrop({
                dropArea: jQuery('.wdj-photos')[0],
                multiple: true,
                hideDropzones: false,
                classes: {
                    dropActive: 'drag-enter-container'
                },
                callbacks: {
                    dropProcessing: function(isProcessing, files) {
                        uploader.addFiles(files);

                        if (files) {
                            var validCount = 0;
                            _.each(files, function(item) {
                                if (!uploader.isAllowedExtension(item.name)) {
                                    validCount += 1;
                                }
                            });

                            scope.$apply(function() {
                                if (files.length === validCount) {
                                    wdAlert.alert(
                                        scope.$root.DICT.photos.ALL_FILES_UNSUPPORT_TITLE,
                                        scope.$root.DICT.photos.ALL_FILES_UNSUPPORT_CONTENT,
                                        scope.$root.DICT.photos.UNSUPPORT_MODAL_BUTTON_OK
                                    );
                                } else if (files.length > validCount && validCount) {
                                    wdAlert.alert(
                                        scope.$root.DICT.photos.SOME_FILES_UNSUPPORT_TITLE,
                                        scope.$root.DICT.photos.SOME_FILES_UNSUPPORT_CONTENT,
                                        scope.$root.DICT.photos.UNSUPPORT_MODAL_BUTTON_OK
                                    );
                                }
                            });
                        }
                    },
                    error: function(code, filename) {},
                    log: function(message, level) {}
                }
            });
            dnd.setup();

            function loadLocalPhoto(file) {
                var defer = $q.defer();
                var reader = new FileReader();

                reader.onload = function(e) {
                    reader.onload = reader.onerror = null;

                    wdpImageHelper.preload(e.target.result).done(function(image) {
                        var width = image.width;
                        var height = image.height;
                        if (height > 170) {
                            width *= 170 / height;
                            height = 170;
                        }
                        wdpImageHelper.canvasResize(image, width, height).done(function(dataURI) {
                            scope.$apply(function() {
                                defer.resolve({
                                    width: width,
                                    height: height,
                                    dataURI: dataURI
                                });
                            });
                        });

                    });
                };
                reader.onerror = function() {
                    reader.onload = reader.onerror = null;
                    scope.$apply(function() {
                        defer.reject('something wrong.');
                    });
                };

                reader.readAsDataURL(file);

                return defer.promise;
            }

            function count() {
                counter += 1;
                if (counter > 0 && !keeper) {
                    keeper = wdKeeper.push('仍有图片在上传中');
                }
            }
            function uncount() {
                counter -= 1;
                if (counter === 0) {
                    keeper.done();
                    keeper = null;
                }
            }
        }
    };
}];
});
