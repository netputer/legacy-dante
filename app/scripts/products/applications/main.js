define([
    'angular',
    'common/main',
    'products/applications/controllers/ApplicationsCtrl'
], function(
    angular,
    common,
    applicationsCtrl
) {

'use strict';

//注册angular的模块和control
angular.module('wdApplications', ['wdCommon'])
        .controller('ApplicationsCtrl', applicationsCtrl);
});