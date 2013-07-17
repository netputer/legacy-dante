define([
    'text!i18n/root/app.json',
    'text!i18n/root/applications.json',
    'text!i18n/root/contacts.json',
    'text!i18n/root/messages.json',
    'text!i18n/root/photos.json',
    'text!i18n/root/portal.json',
    'text!i18n/root/cloudDataSignIn.json'
], function(
    appJSON,
    applicationsJSON,
    contactsJSON,
    messagesJSON,
    photosJSON,
    portalJSON,
    cloudDataSignInJSON
) {
'use strict';

return {
    app: JSON.parse(appJSON),
    applications: JSON.parse(applicationsJSON),
    contacts: JSON.parse(contactsJSON),
    messages: JSON.parse(messagesJSON),
    photos: JSON.parse(photosJSON),
    portal: JSON.parse(portalJSON),
    cloudDataSignIn: JSON.parse(cloudDataSignInJSON)
};

});
