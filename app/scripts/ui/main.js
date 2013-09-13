define([
    'angular',
    'ui/directives/popmenu',
    'ui/services/toast',
    'ui/directives/checkbox',
    'ui/directives/drag-enter-area'
], function(
    angular,
    popmenu,
    toast,
    checkbox,
    dragEnterArea
) {
'use strict';

angular.module('wd.ui', [])
    .directive('wdMenu', popmenu.Menu)
    .directive('wdMenuPopover', popmenu.Popover)
    .directive('wdMenuTrigger', popmenu.Trigger)
    .directive('wdMenuItem', popmenu.MenuItem)
    .directive('wdCheckbox', checkbox)
    .directive('wdDragEnterArea', dragEnterArea)
    .factory('wdToast', toast);
});
