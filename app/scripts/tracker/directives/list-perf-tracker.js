define([
], function() {
    'use strict';

    return ['$timeout', 'wdInteractiveDurationTracker', 
    function($timeout,   wdInteractiveDurationTracker) {
    
        return {
            link: function($scope, $element, $attrs) {
                
                if ($scope.$last) {
                    $timeout(function() {
                        wdInteractiveDurationTracker.track($scope.vertical);
                    });
                }      
            }
        };
    }];
});