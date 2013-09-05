define([
    'angular',
    'ui/directives/popmenu',
    'ui/services/toast',
    'ui/directives/checkbox'
], function(
    angular,
    popmenu,
    toast,
    checkbox
) {
'use strict';

angular.module('wd.ui', [])
    .directive('wdMenu', popmenu.Menu)
    .directive('wdMenuPopover', popmenu.Popover)
    .directive('wdMenuTrigger', popmenu.Trigger)
    .directive('wdMenuItem', popmenu.MenuItem)
    .directive('wdCheckbox', checkbox)
    .factory('wdToast', toast);
});
