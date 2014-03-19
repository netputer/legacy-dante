define([
    'underscore'
], function(
    _
) {
'use strict';
return [ 'wdDataBasic', '$q',
function( wdDataBasic,   $q) {
var wdcContacts = wdDataBasic.getContactsService();
var wdmConversations = wdDataBasic.getMessagesService();

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
