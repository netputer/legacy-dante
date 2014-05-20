define([
	'underscore'
	], function(
	_
	) {
	'use strict';
	return ['wdMessagesService', 'wdBackupChannelDev',
	function(WdMessagesService,   wdBackupChannelDev) {
		function Message() {
		}

		var wdMessagesService = new WdMessagesService(wdBackupChannelDev);
		_.extend(Message.prototype, wdMessagesService);

		return new Message();
	}];
});