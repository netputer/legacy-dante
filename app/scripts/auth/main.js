/*global Modernizr*/
define([
    'angular',
    'auth/services/token',
    'auth/services/googleSignIn',
    'auth/services/wandoujiaSignIn',
    // 'auth/controllers/internationalCtrl',
    'auth/controllers/chineseCtrl'
], function(
    angular,
    authToken,
    googleSignIn,
    wandoujiaSignIn,
    // internationalCtrl,
    chineseCtrl
) {
'use strict';

angular.module('wdAuth', ['wdCommon'])
    .provider('wdAuthToken', authToken)
    .factory('wdGoogleSignIn', googleSignIn)
    .factory('wandoujiaSignIn', wandoujiaSignIn)
    // .controller('internationalController', internationalCtrl)
    .controller('chineseController', chineseCtrl);



});
