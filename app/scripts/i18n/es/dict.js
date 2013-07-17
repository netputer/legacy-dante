define([
    'text!i18n/es/app.json',
    'text!i18n/es/applications.json',
    'text!i18n/es/contacts.json',
    'text!i18n/es/messages.json',
    'text!i18n/es/photos.json',
    'text!i18n/es/portal.json'
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
