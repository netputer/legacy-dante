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
        if (cache) {
            return wdcContacts.searchContacts(query, {sms: true}, cache);
        }
        else {
            return wdcContacts.searchContacts(query, {sms: true});
        }
    }
};

}];
});
