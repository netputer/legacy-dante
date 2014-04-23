define([
    'angular',
    'tracker/directives/list-perf-tracker',
    'tracker/services/active-duration-tracker',
    'tracker/services/interactive-duration-tracker'
], function(
    angular,
    listPerfTracker,
    activeDurationTracker,
    interactiveDurationTracker

) {
    'use strict';

    angular.module('wdTracker', [])
        .directive('wdListPerfTracker', listPerfTracker)
        .factory('wdActiveDuraionTracker', activeDurationTracker)
        .factory('wdInteractiveDurationTracker', interactiveDurationTracker)
    ;
});