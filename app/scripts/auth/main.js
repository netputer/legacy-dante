/*global Modernizr*/
define([
    'angular',
    'auth/services/token',
    'auth/services/googleSignIn',
    // 'auth/controllers/internationalCtrl',
    'auth/controllers/chineseCtrl'
], function(
    angular,
    authToken,
    googleSignIn,
    // internationalCtrl,
    chineseCtrl
) {
'use strict';

angular.module('wdAuth', ['wdCommon'])
    .provider('wdAuthToken', authToken)
    .factory('wdGoogleSignIn', googleSignIn)
    // .controller('internationalController', internationalCtrl)
    .controller('chineseController', chineseCtrl);



});
