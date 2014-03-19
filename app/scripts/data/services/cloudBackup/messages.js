define([
	'underscore'
	], function(
	_
	) {
	'use strict';
	return ['wdMessagesService',
	function(WdMessagesService) {
		function Message() {
		}

		var wdMessagesService = new WdMessagesService();
		_.extend(Message.prototype, wdMessagesService);

		return new Message();
	}];
});