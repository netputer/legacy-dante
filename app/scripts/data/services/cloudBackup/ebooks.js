define([
	'underscore'
	], 
function(
	_
	) {
	'use strict';

	return ['wdEbooksService', 
	function(
			WdEbooksService
		) {
		function Ebooks() {
		}

		var wdEbooksService = new WdEbooksService();
		_.extend(Ebooks.prototype, wdEbooksService);

		return new Ebooks();
	}];
});