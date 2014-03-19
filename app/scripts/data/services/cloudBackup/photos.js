define([
	'underscore'
	], function(
	_
	) {
	'use strict';
	return ['wdPhotosService',
	function(WdPhotosService) {
		function Photo() {
		}

		var wdPhotosService = new WdPhotosService();
		_.extend(Photo.prototype, wdPhotosService);

		return	new Photo();
	}];
});