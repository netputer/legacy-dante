define([
    'text!i18n/zh-cn/app.json',
    'text!i18n/zh-cn/applications.json',
    'text!i18n/zh-cn/contacts.json',
    'text!i18n/zh-cn/messages.json',
    'text!i18n/zh-cn/photos.json',
    'text!i18n/zh-cn/portal.json'
], function(
    appJSON,
    applicationsJSON,
    contactsJSON,
    messagesJSON,
    photosJSON,
    portalJSON
) {
'use strict';

return {
    app: JSON.parse(appJSON),
    applications: JSON.parse(applicationsJSON),
    contacts: JSON.parse(contactsJSON),
    messages: JSON.parse(messagesJSON),
    photos: JSON.parse(photosJSON),
    portal: JSON.parse(portalJSON)
};

});
