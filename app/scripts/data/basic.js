define([], function() {
    'use strict';
    return ['wdVirtualDeviceCloudLocker', 'wdVirtualDeviceCloudBackup', 'wdVirtualDeviceSnapPea',
    function(wdVirtualDeviceCloudLocker,   wdVirtualDeviceCloudBackup,   wdVirtualDeviceSnapPea) {
        var currentVirtualDevice;
        var valid = false;
        var api = {
            init: function(deviceInfo) {
                switch(deviceInfo.currentDeviceType) {
                    case 0:
                        currentVirtualDevice = wdVirtualDeviceSnapPea;
                        break;
                    case 1:
                        currentVirtualDevice = wdVirtualDeviceCloudBackup;
                        break;
                    case 2: 
                        currentVirtualDevice = wdVirtualDeviceCloudLocker;
                        break;
                }

                currentVirtualDevice.init(deviceInfo);

                return api;
            },

            buildConnection: function() {
                return currentVirtualDevice.buildConnection()
                    .then(function() {
                        valid = true;
                    }, function() {
                        valid = false;
                    });
            },

            shutDownConnection: function() {
                return currentVirtualDevice.shutDownConnection();
            },

            getCurrentDevice: function() {
                
            },

            valid: function() {
                return valid;
            },

            dev: function() {
                return currentVirtualDevice.dev();
            },

            clearDeviceData: function() {
                return currentVirtualDevice.clearDeviceData();
            },

            getAppsService: function() {
                return currentVirtualDevice.getAppsService();
            },

            getContactsService: function() {
                return currentVirtualDevice.getContactsService();
            },

            getMessagesService: function() {
                return currentVirtualDevice.getMessagesService();
            },

            getPhotosService: function() {
                return currentVirtualDevice.getPhotosService();
            }

        };

        return api;
    }];
});