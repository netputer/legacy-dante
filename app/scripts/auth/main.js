/*global Modernizr*/
define([
    'angular',
    'auth/services/device',
    'auth/services/connection',
    'auth/internationalAuth/services/auth',
    'auth/internationalAuth/services/signInDetection',
    'auth/internationalAuth/controllers/auth',
    'auth/internationalAuth/directives/user-profile-button',
    'auth/wandoujiaAuth/services/auth',
    'auth/wandoujiaAuth/controllers/auth'
], function(
    angular,
    device,
    connection,
    internationalAuth,
    signInDetection,
    internationalAuthController,
    userProfileButton,
    wandoujiaAuth,
    wandoujiaAuthController
) {
'use strict';

angular.module('wdAuth', ['wdCommon'])
    .provider('wdDevice', device)
    .factory('wdConnection', connection)

    .factory('wdInternationalAuth', internationalAuth)
    .factory('wdSignInDetection', signInDetection)
    .controller('internationalAuthController', internationalAuthController)
    .directive('wdUserProfileButton', userProfileButton)

    .factory('wdWandoujiaAuth', wandoujiaAuth)
    .controller('wandoujiaAuthController', wandoujiaAuthController);
});
