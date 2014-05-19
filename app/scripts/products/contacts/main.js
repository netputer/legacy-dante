define([
    'angular',
    'common/main',
    'products/contacts/controllers/ContactsCtrl',
    'products/contacts/directives/auto-scroll'
], function(
    angular,
    common,
    contactsCtrl,
    autoScroll
) {

'use strict';

//注册angular的模块和control
angular.module('wdContacts', ['wdCommon'])
    .controller('ContactsCtrl', contactsCtrl)
    .directive('wdcAutoScroll', autoScroll);
});
