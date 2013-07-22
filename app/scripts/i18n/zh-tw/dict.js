define([
    'text!i18n/zh-tw/app.json',
    'text!i18n/zh-tw/applications.json',
    'text!i18n/zh-tw/contacts.json',
    'text!i18n/zh-tw/messages.json',
    'text!i18n/zh-tw/photos.json',
    'text!i18n/zh-tw/portal.json',
    'text!i18n/zh-tw/permissions.json'
], function(
    appJSON,
    applicationsJSON,
    contactsJSON,
    messagesJSON,
    photosJSON,
    portalJSON,
    permissionsJSON
) {
'use strict';

return {
    app: JSON.parse(appJSON),
    applications: JSON.parse(applicationsJSON),
    contacts: JSON.parse(contactsJSON),
    messages: JSON.parse(messagesJSON),
    photos: JSON.parse(photosJSON),
    portal: JSON.parse(portalJSON),
    permissions: JSON.parse(permissionsJSON)
};

});
