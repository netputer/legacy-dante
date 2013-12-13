define([
    'angular',
    'ui/directives/popmenu',
    'ui/services/toast',
    'ui/directives/checkbox',
    'ui/directives/drag-enter-area',
    'ui/directives/setting-switch'
], function(
    angular,
    popmenu,
    toast,
    checkbox,
    dragEnterArea,
    settingSwitch
) {
'use strict';

angular.module('wd.ui', [])
    .directive('wdMenu', popmenu.Menu)
    .directive('wdMenuPopover', popmenu.Popover)
    .directive('wdMenuTrigger', popmenu.Trigger)
    .directive('wdMenuItem', popmenu.MenuItem)
    .directive('wdCheckbox', checkbox)
    .directive('wdDragEnterArea', dragEnterArea)
    .directive('wdSettingSwitch', settingSwitch)
    .factory('wdToast', toast);
});
