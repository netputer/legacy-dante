/*global Modernizr*/
define([
    'angular',
    'auth/services/device',
    'auth/services/googleSignIn',
    'auth/services/wandoujiaSignIn',
    'auth/controllers/internationalCtrl',
    'auth/controllers/cloudDataCtrl',
<<<<<<< HEAD
    'auth/directives/user-profile-button',
    'auth/services/signinDetection'
=======
    'auth/directives/user-profile-button'
>>>>>>> 977ffb2afaf1daba479b29185252e55fff0ed31f
], function(
    angular,
    device,
    googleSignIn,
    wandoujiaSignIn,
    internationalCtrl,
    cloudDataCtrl,
<<<<<<< HEAD
    userProfileButton,
    signinDetection
=======
    userProfileButton
>>>>>>> 977ffb2afaf1daba479b29185252e55fff0ed31f
) {
'use strict';

angular.module('wdAuth', ['wdCommon'])
    .provider('wdDevice', device)
    .factory('wdGoogleSignIn', googleSignIn)
    .factory('wandoujiaSignIn', wandoujiaSignIn)
    .controller('internationalController', internationalCtrl)
    .controller('cloudDataController', cloudDataCtrl)
<<<<<<< HEAD
    .directive('wdUserProfileButton', userProfileButton)
    .factory('wdSigninDetection', signinDetection);
=======
    .directive('wdUserProfileButton', userProfileButton);
>>>>>>> 977ffb2afaf1daba479b29185252e55fff0ed31f
});
