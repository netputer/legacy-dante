define([
    'underscore'
], function(
    _
) {
'use strict';
return ['wdmConversations', 'wdcContacts', '$q',
function(wdmConversations,   wdcContacts,   $q) {

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
