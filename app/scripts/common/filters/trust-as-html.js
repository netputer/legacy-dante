define([
], function(
) {
'use strict';
    return ['$sce', function($sce) {
        return function (input) {
            return $sce.trustAsHtml(input);
        };

    }];
});