define([
    'text!i18n/th/app.json',
    'text!i18n/th/applications.json',
    'text!i18n/th/contacts.json',
    'text!i18n/th/messages.json',
    'text!i18n/th/photos.json',
    'text!i18n/th/portal.json'
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
