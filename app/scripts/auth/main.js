/*global Modernizr*/
define([
    'angular',
    'auth/services/token',
    'auth/services/googleSignIn',
    'auth/services/wandoujiaSignIn',
    // 'auth/controllers/internationalCtrl',
    'auth/controllers/cloudDataCtrl'
], function(
    angular,
    authToken,
    googleSignIn,
    wandoujiaSignIn,
    // internationalCtrl,
    cloudDataCtrl
) {
'use strict';

angular.module('wdAuth', ['wdCommon'])
    .provider('wdAuthToken', authToken)
    .factory('wdGoogleSignIn', googleSignIn)
    .factory('wandoujiaSignIn', wandoujiaSignIn)
    // .controller('internationalController', internationalCtrl)
    .controller('cloudDataController', cloudDataCtrl);
});
