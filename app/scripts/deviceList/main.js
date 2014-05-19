define([
    'angular',
    'deviceList/services/device'
], function(
    angular,
    device
) {
'use strict';
    
    angular.module('wdDeviceList',[])
        .provider('wdDevice', device);
});