define([
    'text!i18n/pt-br/app.json',
    'text!i18n/pt-br/applications.json',
    'text!i18n/pt-br/contacts.json',
    'text!i18n/pt-br/messages.json',
    'text!i18n/pt-br/photos.json',
    'text!i18n/pt-br/portal.json'
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
