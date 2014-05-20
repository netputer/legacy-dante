define([
    'angular',
    'products/photos/directives/showcase',
    'products/photos/directives/actionbar',
    'products/photos/directives/slides',
    'products/photos/directives/block',
    'products/photos/directives/uploader',
    'products/photos/directives/frame',
    'products/photos/directives/progress',
    'products/photos/directives/repeat',
    'products/photos/controllers/gallery',
    'products/photos/directives/gallery',
    'common/main',
    'products/photos/filters/custom-size'
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
