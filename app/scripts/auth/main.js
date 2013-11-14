/*global Modernizr*/
define([
    'angular',
    'auth/services/device',
    'auth/services/googleSignIn',
    'auth/services/wandoujiaSignIn',
    'auth/controllers/internationalCtrl',
    'auth/controllers/cloudDataCtrl',
    'auth/directives/google-button',
    'auth/directives/user-profile-button'
], function(
    angular,
    device,
    googleSignIn,
    wandoujiaSignIn,
    internationalCtrl,
    cloudDataCtrl,
    googleButton,
    userProfileButton
) {
'use strict';

angular.module('wdAuth', ['wdCommon'])
    .provider('wdDevice', device)
    .factory('wdGoogleSignIn', googleSignIn)
    .factory('wandoujiaSignIn', wandoujiaSignIn)
    .controller('internationalController', internationalCtrl)
    .controller('cloudDataController', cloudDataCtrl)
    .directive('wdGoogleButton', googleButton)
    .directive('wdUserProfileButton', userProfileButton);
});
