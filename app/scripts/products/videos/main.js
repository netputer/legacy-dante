define([
	'angular',
	'products/videos/controllers/videos'
], function(
	angular,
	videosController
) {
	'use strict';

	angular.module('wdVideos', ['wdCommon'])
		.controller('wdVideosController', videosController);
});