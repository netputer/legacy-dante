define([
    'angular',
    'photos/directives/showcase',
    'photos/directives/actionbar',
    'photos/directives/slides',
    'photos/directives/block',
    'photos/directives/uploader',
    'photos/directives/frame',
    'photos/directives/progress',
    'photos/directives/repeat',
    'photos/controllers/gallery',
    'photos/directives/gallery',
    'common/main',
    'photos/filters/custom-size'
], function(
    angular,
    showcase,
    actionbar,
    slides,
    block,
    uploader,
    frame,
    progress,
    repeat,
    galleryController,
    gallery,
    common,
    customSize
) {
'use strict';
// jshint unused:false
angular.module('wdPhotos', ['wdCommon', 'ngResource'])
    .constant('WDP_LOAD_IMAGE_DELAY', 200)
    .constant('WDP_PRELOAD_IMAGE_OFFSET', 100)
    .constant('WDP_PLAYING_INTERVAL', 3000)
    .directive('wdpUploader', uploader)
    .directive('wdpGallery', gallery)
    .directive('wdpShowcase', showcase)
    .directive('wdpBlock', block)
    .directive('wdpActionbar', actionbar)
    .directive('wdpSlides', slides)
    .directive('wdpFrame', frame)
    .directive('wdpProgress', progress)
    .directive('wdpRepeat', repeat)
    .controller('galleryController', galleryController)
    .filter('customSize', customSize);

});
