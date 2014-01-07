/*global Modernizr*/
define([
    'angular',
    'auth/services/device',
    'auth/services/googleSignIn',
    'auth/services/wandoujiaSignIn',
    'auth/controllers/internationalCtrl',
    'auth/controllers/cloudDataCtrl',
    'auth/directives/user-profile-button',
    'auth/services/signInDetection'
], function(
    angular,
    device,
    googleSignIn,
    wandoujiaSignIn,
    internationalCtrl,
    cloudDataCtrl,
    userProfileButton,
    signInDetection
) {
'use strict';

angular.module('wdAuth', ['wdCommon'])
    .provider('wdDevice', device)
    .factory('wdGoogleSignIn', googleSignIn)
    .factory('wandoujiaSignIn', wandoujiaSignIn)
    .controller('internationalController', internationalCtrl)
    .controller('cloudDataController', cloudDataCtrl)
    .directive('wdUserProfileButton', userProfileButton)
    .factory('wdSignInDetection', signInDetection);
});
