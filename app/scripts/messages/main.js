define([
    'angular',
    'common/main',
    'messages/controllers/conversation',
    'messages/directives/autoscroll',
    'messages/filters/group',
    'messages/directives/loadmore',
    'messages/filters/ms',
    'messages/filters/message-date',
    'messages/filters/emoji',
    'messages/directives/realtime',
    'messages/directives/textarea',
    'messages/directives/receiver',
    'messages/services/conversations',
    'messages/services/message',
    'messages/services/messages-collection',
    'messages/services/conversation-messages-collection',
    'messages/services/search-messages-collection',
    'messages/services/sync-messages-collection',
    'messages/services/conversation',
    'messages/services/conversations-collection',
    'messages/services/basic-conversation',
    'messages/services/search-conversation',
    'messages/services/extended-conversations-collection',
    'messages/directives/keep-visible',
    'messages/directives/selection',
    'messages/services/search',
    'messages/directives/contact-card',
    'messages/directives/audio'
], function(
    angular,
    common,
    conversationController,
    autoscroll,
    groupFilter,
    loadmore,
    msFilter,
    messageDateFilter,
    emojiFilter,
    realtime,
    textarea,
    receiver,
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
    keepVisible,
    selection,
    search,
    contactCard,
    audio
) {
'use strict';
// jshint unused:false
angular.module('wdMessages', ['wdCommon'])
    .controller('wdmConversationController', conversationController)
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
    .factory('wdmConversations', conversations)
    .factory('wdmContactSearch', search)
    .directive('wdmAutoScroll', autoscroll)
    .directive('wdmLoadMore', loadmore)
    .directive('wdmRealtime', realtime)
    .directive('wdmTextarea', textarea)
    .directive('wdmReceiver', receiver)
    .directive('wdmKeepVisible', keepVisible)
    .directive('wdmSelection', selection)
    .directive('wdmContactCard', contactCard)
    .directive('wdmAudio', audio)
    .filter('ms', msFilter)
    .filter('group', groupFilter)
    .filter('messageDate', messageDateFilter)
    .filter('emoji', emojiFilter);
});
