define([
    'angular',
    'ui/directives/popmenu'
], function(
    angular,
    popmenu
) {
'use strict';

angular.module('wd.ui', [])
    .directive('wdMenu', popmenu.Menu)
    .directive('wdMenuPopover', popmenu.Popover)
    .directive('wdMenuTrigger', popmenu.Trigger)
    .directive('wdMenuItem', popmenu.MenuItem);
});
