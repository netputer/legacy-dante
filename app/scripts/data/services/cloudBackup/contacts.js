define([
    'underscore'
    ], function(
    _
    ) {
    'use strict';
    return ['wdContactsService',
    function(WdContactsService) {
        function Contacts() {
        }

        var wdContactsService = new WdContactsService();
        _.extend(Contacts.prototype, wdContactsService);


        return new Contacts();
    }];
});