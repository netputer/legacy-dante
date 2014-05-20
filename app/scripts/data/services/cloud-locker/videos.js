define([
	'underscore'
	], 
function(
	_
	) {
	'use strict';

	return ['wdVideosService', 
	function(
			WdVideosService
		) {
		function Videos() {
		}

		var wdVideosService = new WdVideosService();
		_.extend(Videos.prototype, wdVideosService);

		return new Videos();
	}];
});