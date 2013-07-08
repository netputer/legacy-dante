/*global Modernizr*/
define([
    'angular',
    'auth/services/token',
    'auth/services/googleSignIn',
    'auth/controllers/internationalCtrl'
], function(
    angular,
    authToken,
    googleSignIn,
    internationalCtrl
) {
'use strict';

angular.module('wdAuth', ['wdCommon'])
    .provider('wdAuthToken', authToken)
    .factory('wdGoogleSignIn', googleSignIn)
    .controller('internationalController', internationalCtrl);
});
