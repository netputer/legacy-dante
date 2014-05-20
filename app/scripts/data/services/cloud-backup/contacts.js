define([
    'underscore'
    ], function(
    _
    ) {
    'use strict';
    return ['wdContactsService', 'wdBackupChannelDev',
    function(WdContactsService,   wdBackupChannelDev) {
        function Contacts() {
        }

        var wdContactsService = new WdContactsService(wdBackupChannelDev);
        _.extend(Contacts.prototype, wdContactsService);


        return new Contacts();
    }];
});