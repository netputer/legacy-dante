define([
    'angular',
    'ui/directives/popmenu',
    'ui/services/toast'
], function(
    angular,
    popmenu,
    toast
) {
'use strict';

angular.module('wd.ui', [])
    .directive('wdMenu', popmenu.Menu)
    .directive('wdMenuPopover', popmenu.Popover)
    .directive('wdMenuTrigger', popmenu.Trigger)
    .directive('wdMenuItem', popmenu.MenuItem)
    .factory('wdToast', toast);
});
