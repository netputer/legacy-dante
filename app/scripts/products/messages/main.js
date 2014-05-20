define([
    'angular',
    'common/main',
    'products/messages/controllers/conversation',
    'products/messages/directives/autoscroll',
    'products/messages/filters/group',
    'products/messages/directives/loadmore',
    'products/messages/filters/ms',
    'products/messages/filters/message-date',
    'products/messages/filters/emoji',
    'products/messages/directives/realtime',
    'products/messages/directives/textarea',
    'products/messages/directives/receiver',
    'products/messages/directives/keep-visible',
    'products/messages/directives/selection',
    'products/messages/directives/contact-card',
    'products/messages/directives/audio'
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
    keepVisible,
    selection,
    contactCard,
    audio
) {
'use strict';
// jshint unused:false
angular.module('wdMessages', ['wdCommon'])
    .controller('wdmConversationController', conversationController)
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
