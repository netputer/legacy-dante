/*global Modernizr*/
define([
    'angular',
    'auth/services/device',
    'auth/services/internationalAccount',
    'auth/services/wandoujiaAccount',
    'auth/controllers/internationalCtrl',
    'auth/controllers/cloudDataCtrl',
    'auth/directives/user-profile-button',
    'auth/services/signInDetection',
    'auth/services/connect'
], function(
    angular,
    device,
    internationalAccount,
    wandoujiaAccount,
    internationalCtrl,
    cloudDataCtrl,
    userProfileButton,
    signInDetection,
    connect
) {
'use strict';

angular.module('wdAuth', ['wdCommon'])
    .provider('wdDevice', device)
    .factory('internationalAccount', internationalAccount)
    .factory('wandoujiaAccount', wandoujiaAccount)
    .controller('internationalController', internationalCtrl)
    .controller('cloudDataController', cloudDataCtrl)
    .directive('wdUserProfileButton', userProfileButton)
    .factory('wdSignInDetection', signInDetection)
    .factory('wdConnect', connect);
});
