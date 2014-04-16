define([
    'angular',
    'data/virtualDeviceFactory',
    'data/virtualDevices/cloud',
    'data/virtualDevices/cloudBackup',
    'data/virtualDevices/cloudLocker',
    'data/virtualDevices/snapPea',
    'data/dataChannel/backup/dev',
    'data/services/common/applications',
    'data/services/common/contacts',

    'data/services/common/messages/conversations',
    'data/services/common/messages/message',
    'data/services/common/messages/messages-collection',
    'data/services/common/messages/conversation-messages-collection',
    'data/services/common/messages/search-messages-collection',
    'data/services/common/messages/sync-messages-collection',
    'data/services/common/messages/conversation',
    'data/services/common/messages/conversations-collection',
    'data/services/common/messages/basic-conversation',
    'data/services/common/messages/search-conversation',
    'data/services/common/messages/extended-conversations-collection',
    'data/services/common/messages/search',

    'data/services/common/photos/photos',
    'data/services/common/photos/image-helper',
    'data/services/common/photos/layout-algorithm',
    'data/services/common/photos/message-pusher',
    'data/services/common/photos/photo-setting',

    'data/services/common/videos',
    'data/services/common/ebooks',

    'data/services/cloudBackup/applications',
    'data/services/cloudBackup/contacts',
    'data/services/cloudBackup/messages',
    'data/services/cloudBackup/photos',
    'data/services/cloudBackup/videos',
    'data/services/cloudBackup/ebooks',
], function(
    angular,
    virtualDeviceFactory,
    cloud,
    cloudBackup,
    cloudLocker,
    snapPea,
    backupChannelDev,
    Apps,
    contacts,

    conversations,
    messageFactory,
    messagesCollectionFactory,
    conversationMessagesCollectionFactory,
    searchMessagesCollectionFactory,
    syncMessagesCollectionFactory,
    conversationFactory,
    conversationsCollectionFactory,
    basicConversationFactory,
    searchConversationFactory,
    extendedConversationsCollectionFactory,
    search,

    photos,
    imageHelper,
    layoutAlgorithm,
    messagePusher,
    photoSetting,

    videos,
    ebooks,

    backupApps,
    backupContacts,
    backupMessages,
    backupPhotos,
    backupVideos,
    backupEbooks
) {
'use strict';

angular.module('wdData', [])
    .factory('wdBackupChannelDev', backupChannelDev)

    .factory('wdAppsService', Apps)
    .factory('wdContactsService', contacts)
    
    .factory('PhotosLayoutAlgorithm', layoutAlgorithm)
    .factory('wdpImageHelper', imageHelper)
    .factory('wdpMessagePusher', messagePusher)
    .factory('wdpPhotoSetting', photoSetting)
    .factory('wdPhotosService', photos)

    .factory('wdVideosService', videos)
    .factory('wdEbooksService', ebooks)

    .factory('wdmMessage', messageFactory)
    .factory('wdmMessagesCollection', messagesCollectionFactory)
    .factory('wdmSyncMessagesCollection', syncMessagesCollectionFactory)
    .factory('wdmConversationMessagesCollection', conversationMessagesCollectionFactory)
    .factory('wdmSearchMessagesCollection', searchMessagesCollectionFactory)
    .factory('wdmBasicConversation', basicConversationFactory)
    .factory('wdmConversation', conversationFactory)
    .factory('wdmSearchConversation', searchConversationFactory)
    .factory('wdmConversationsCollection', conversationsCollectionFactory)
    .factory('wdmExtendedConversationsCollection', extendedConversationsCollectionFactory)
    .factory('wdmContactSearch', search)
    .factory('wdMessagesService', conversations)


    .factory('wdBackupAppsService',backupApps)
    .factory('wdBackupContactsService', backupContacts)
    .factory('wdBackupMessagesService', backupMessages)
    .factory('wdBackupPhotosService', backupPhotos)
    .factory('wdBackupVideosService', backupVideos)
    .factory('wdBackupEbooksService', backupEbooks)
    
    .factory('wdVirtualDeviceCloud', cloud)
    .factory('wdVirtualDeviceCloudLocker', cloudLocker)
    .factory('wdVirtualDeviceCloudBackup', cloudBackup)
    .factory('wdVirtualDeviceSnapPea', snapPea)

    .factory('wdVirtualDeviceFactory', virtualDeviceFactory)
    ;
});
