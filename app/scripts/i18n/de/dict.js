define([
    'text!i18n/de/app.json',
    'text!i18n/de/applications.json',
    'text!i18n/de/contacts.json',
    'text!i18n/de/messages.json',
    'text!i18n/de/photos.json',
    'text!i18n/de/portal.json',
    'text!i18n/de/permissions.json'
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
