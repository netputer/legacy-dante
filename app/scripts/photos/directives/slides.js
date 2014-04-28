define([
    'text!templates/photos/slides.html',
    'underscore',
    'angular'
], function(
    template,
    _,
    angular
) {
'use strict';
return ['WDP_PLAYING_INTERVAL',   '$rootScope', 'wdViewport', 'wdKey', 'GA', 'wdAlert', '$filter', 'wdDev', 'wdSharing',
    function(WDP_PLAYING_INTERVAL, $rootScope,   wdViewport,   wdKey,   GA,   wdAlert,   $filter,   wdDev,   wdSharing) {
    return {
        template: template,
        replace: true,
        controller: ['$scope', function($scope) {
                var self = this;

                // Return the current previewing photo's index of all photos in real time.
                self.getCurIndex = function() {
                    return _.indexOf($scope.photos, $scope.current);
                };

                // Switch photos.
                self.next = function() {
                    $scope.current = $scope.photos[self.getCurIndex() + 1];
                };
                self.previous = function() {
                    $scope.current = $scope.photos[self.getCurIndex() - 1];
                };

                // Start autoplay.
                var autoplayTimer = null;
                self.play = function() {
                    // Do nothing if it has been autoplaying.
                    if (autoplayTimer !== null) {
                        return;
                    }
                    autoplayTimer = setInterval(function() {
                        // Keep playing straight forward, no loop.
                        if (self.getCurIndex() < $scope.photos.length - 1) {
                            $scope.$apply(function() {
                                self.next();
                            });
                        }
                        else {
                            $scope.$apply(function() {
                                self.pause();
                            });
                        }
                    }, WDP_PLAYING_INTERVAL);
                    $scope.playing = true;
                };
                self.pause = function() {
                    // Pause can be called without detecting autoplay state.
                    clearInterval(autoplayTimer);
                    autoplayTimer = null;
                    $scope.playing = false;
                };

                // Indicates whether there is something on loading state.
                // If true, turn on loading animation.
                $scope.playing = false;
                $scope.playButtonText = $rootScope.DICT.photos.SLIDES_PLAY;
                $scope.play = function() {
                    $scope.playButtonText = $rootScope.DICT.photos.SLIDES_PAUSE;
                    self.play();
                };
                $scope.pause = function() {
                    $scope.playButtonText = $rootScope.DICT.photos.SLIDES_PLAY;
                    self.pause();
                };
                $scope.togglePlay = function() {
                    if ($scope.playing) {
                        $scope.pause();
                        GA('photos:slide:pause');
                    }
                    else {
                        if (wdDev.isWapRemoteConnection()) {
                            wdAlert.confirm(
                                $rootScope.DICT.photos.WAP_CONNECTION_SLIDES_COMFIRM.TITLE,
                                $rootScope.DICT.photos.WAP_CONNECTION_SLIDES_COMFIRM.CONTENT,
                                $rootScope.DICT.photos.WAP_CONNECTION_SLIDES_COMFIRM.OK,
                                $rootScope.DICT.photos.WAP_CONNECTION_SLIDES_COMFIRM.CANCEL
                            ).then(function() {
                                $scope.play();
                                GA('photos:slide:play');
                            });
                        } else {
                            $scope.play();
                            GA('photos:slide:play');
                        }
                        
                        
                    }
                };
                $scope.togglePlayKeyboard = function() {
                    if ($scope.playing) {
                        $scope.pause();
                        GA('photos:slide:pause_key');
                    }
                    else {
                        $scope.play();
                        GA('photos:slide:play_key');
                    }
                };
                $scope.next = function() {
                    self.pause();
                    self.next();
                };
                $scope.previous = function() {
                    self.pause();
                    self.previous();
                };
                $scope.hasNext = function() {
                    return self.getCurIndex() < $scope.photos.length - 1;
                };
                $scope.hasPrevious = function() {
                    return self.getCurIndex() > 0;
                };
                $scope.close = function() {
                    self.pause();
                    $scope.current = null;
                };
                $scope.remove = function() {
                    self.pause();
                    var index = self.getCurIndex();
                    $scope['delete']({photo: $scope.current}).then(function() {
                        if (index < $scope.photos.length) {
                            $scope.current = $scope.photos[index];
                        }
                        else if ($scope.hasPrevious()) {
                            $scope.current = $scope.photos[index - 1];
                        }
                        else {
                            $scope.close();
                        }
                    });
                };
                $scope.rotate = function() {
                    $scope.$broadcast('rotate');
                };

                $scope.shareToweibo = function(photo) {
                    wdSharing.weibo(photo);
                };

                $scope.shareToQzone = function(photo) {
                    wdSharing.qzone(photo);
                };
            }],
        scope: {
            current: '=',
            photos: '=',
            'delete': '&onDelete',
            download: '&onDownload',
            share: '&onShare',
            shareToWeibo: '&onShareToWeibo',
            shareToQzone: '&onShareToQzone'
        },
        link: function($scope, element/*, attr, controller*/) {
            // Update dimensions when:
            // 1. viewport dimensions changed.
            wdViewport.on('resize', function() {
                if ($scope.current !== null) {
                    $scope.$broadcast('resize');
                }
            });

            var timeStart = null;
            var maskImage = null;
            var open = function() {
                if (!element.hasClass('slides-active')) {
                    maskImage = createAnimation();
                    element.addClass('slides-active');
                    $scope.$broadcast('hide');
                    $scope.$broadcast('open');
                    maskImage.promise().done(function() {
                        setTimeout(function() {
                            $scope.$broadcast('show');
                            maskImage.remove();
                            maskImage = null;
                        }, 400);
                    });
                }
                else if (maskImage) {
                    $scope.$broadcast('show');
                    maskImage.remove();
                    maskImage = null;
                }
                timeStart = (new Date()).getTime();
            };
            var close = function() {
                if (maskImage) {
                    maskImage.remove();
                    maskImage = null;
                }
                $scope.$broadcast('close');
                $scope.close();
                element.removeClass('slides-active');
                GA('photos:slide:stay:' + ((new Date()).getTime() - timeStart));
            };

            function createAnimation() {
                var img = angular.element('<img>');
                img.attr('src', $filter('wrapRemoteConnectionURL')($scope.current.thumbnail_path, 'image'));
                var body = angular.element('body');

                var index = $scope.photos.indexOf($scope.current);
                var block = angular.element('.wdp-block:nth-of-type(' + (index + 1) + ')');
                var offset = block.offset();

                img.css({
                    opacity: 0,
                    position: 'fixed',
                    left: offset.left + $scope.$parent.layout.metas[index].innerX,
                    top: offset.top + $scope.$parent.layout.metas[index].innerY,
                    'z-index': 100000
                });

                body.append(img);

                // force reflow
                img.offset();

                var windowWidth = angular.element(window).width();
                var windowHeight = angular.element(window).height();

                var horizontal = $scope.current.orientation % 180 === 0;
                var frameWidth = windowWidth - 90 * 2;
                var frameHeight = windowHeight - 30 - 80;
                var frameLeft = 90;
                var frameTop = 30;

                var imageWidth = horizontal ? $scope.current.width : $scope.current.height;
                var imageHeight = horizontal ? $scope.current.height : $scope.current.width;


                var widthScale = imageWidth / frameWidth;
                var heightScale = imageHeight / frameHeight;
                var scale = Math.max(widthScale, heightScale);

                if (scale > 1) {
                    imageWidth = imageWidth / scale;
                    imageHeight = imageHeight / scale;
                }

                var offsetX = (frameWidth - imageWidth) / 2;
                var offsetY = (frameHeight - imageHeight) / 2;

                img.animate({
                    opacity: 1,
                    left: offsetX + frameLeft,
                    top: offsetY + frameTop,
                    width: imageWidth,
                    height: imageHeight
                });

                return img;
            }

            // Watch 'current' to toggle open/close.
            var keyboardScope = null;
            $scope.$watch('current', function(newPhoto, oldPhoto) {
                if (newPhoto === oldPhoto) {
                    return;
                }
                if (newPhoto !== null) {
                    if (keyboardScope === null) {
                        keyboardScope = wdKey.push('photos:preview');
                    }
                    open();
                }
                else {
                    close();
                    keyboardScope.done();
                    keyboardScope = null;
                }
            });

            // close slides when user click directly on the container
            element
                .on('click', function(e) {
                    if (e.target === this) {
                        $scope.$apply(close);
                        GA('photos:slide:empty');
                    }
                })
                .on('click', '.frame', function(e) {
                    if (e.target === this) {
                        $scope.$apply(close);
                        GA('photos:slide:empty');
                    }
                });

            // Shortcuts
            wdKey.$apply('left, up, k, h', 'photos:preview', function() {
                if ($scope.hasPrevious()) {
                    $scope.previous();
                    GA('photos:slide:previous_key');
                }
                return false;
            });
            wdKey.$apply('right, down, j, l', 'photos:preview', function() {
                if ($scope.hasNext()) {
                    $scope.next();
                    GA('photos:slide:next_key');
                }
                return false;
            });
            wdKey.$apply('space', 'photos:preview', function() {
                $scope.togglePlayKeyboard();
            });
            wdKey.$apply('r', 'photos:preview', function() {
                $scope.rotate();
                GA('photos:slide:rotate_key');
            });
            wdKey.$apply('d', 'photos:preview', function() {
                $scope.remove();
                GA('photos:slide:delete_key');
            });
            wdKey.$apply('s', 'photos:preview', function() {
                $scope.download({photo: $scope.current});
                GA('photos:slide:download_key');
            });
            wdKey.$apply('esc', 'photos:preview', function() {
                close();
                GA('photos:slide:close_key');
                return false;
            });
            $scope.$on('$destroy', function() {
                if (keyboardScope) {
                    keyboardScope.done();
                }
                wdKey.deleteScope('photos:preview');
            });
        }
    };
}];
});
