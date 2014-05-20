define([
    'underscore'
], function(
    _
) {
'use strict';
return [ 'wdVirtualDeviceFactory', '$q',
function( wdVirtualDeviceFactory,   $q) {
    var currentDevice = wdVirtualDeviceFactory.getCurrentDevice();
    var wdcContacts = currentDevice.getContactsService();
    var wdmConversations = currentDevice.getMessagesService();

    return {
        init: function() {
            wdcContacts.init();
        },
        search: function(query) {
            var cache = wdmConversations.getContactsCache();
            var config = {
                sms: true
            };
            if (cache) {
                config.cache = cache;
            }
            return wdcContacts.searchContacts(query, config);
        }
    };

}];
});
