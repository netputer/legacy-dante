define([
    'angular',
    'ui/directives/popmenu',
    'ui/services/toast',
    'ui/directives/checkbox',
    'ui/directives/drag-enter-area',
    'ui/directives/setting-switch',
    'ui/directives/wd-circle-loading'    
], function(
    angular,
    popmenu,
    toast,
    checkbox,
    dragEnterArea,
    settingSwitch,
    wdCircleLoading
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
    .directive('wdCircleLoading', wdCircleLoading)    
    .factory('wdToast', toast);
});
