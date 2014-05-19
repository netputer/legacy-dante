define([
	'underscore'
	], function(
	_
	) {
	'use strict';
	return ['wdPhotosService', 'wdBackupChannelDev',
	function(WdPhotosService,   wdBackupChannelDev) {
		function Photo() {
		}

		var wdPhotosService = new WdPhotosService(wdBackupChannelDev);
		_.extend(Photo.prototype, wdPhotosService);

		return	new Photo();
	}];
});