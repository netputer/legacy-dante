define([
    'text!i18n/zh-cn/app.json',
    'text!i18n/zh-cn/applications.json',
    'text!i18n/zh-cn/contacts.json',
    'text!i18n/zh-cn/contactType.json',
    // 'text!i18n/zh-cn/cloudDataSignIn.json',
    'text!i18n/zh-cn/messages.json',
    'text!i18n/zh-cn/photos.json',
    'text!i18n/zh-cn/permissions.json',
    'text!i18n/zh-cn/portal.json'
], function(
    appJSON,
    applicationsJSON,
    contactsJSON,
    contactTypeJSON,
    // cloudDataSignInJSON,
    messagesJSON,
    photosJSON,
    permissionsJSON,
    portalJSON
) {
'use strict';

return {
    app: JSON.parse(appJSON),
    applications: JSON.parse(applicationsJSON),
    contacts: JSON.parse(contactsJSON),
    contactType: JSON.parse(contactTypeJSON),
    // cloudDataSign: JSON.parse(cloudDataSignInJSON),
    messages: JSON.parse(messagesJSON),
    photos: JSON.parse(photosJSON),
    permissions: JSON.parse(permissionsJSON),
    portal: JSON.parse(portalJSON)
};

});
