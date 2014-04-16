define([
    'underscore'
    ], function(
    _
    ) {
    'use strict';
    return ['wdVirtualDeviceCloudLocker', 'wdVirtualDeviceCloudBackup', 'wdVirtualDeviceSnapPea',
    function(WdVirtualDeviceCloudLocker,   WdVirtualDeviceCloudBackup,   WdVirtualDeviceSnapPea) {

        function VirtualDevice() {
            this.currentVirtualDevice = null;

            this.virtualDeviceSnapPea = null;
            this.virtualDeviceCloudBackup = null;
            this.virtualDeviceCloudLocker = null;
        }

        _.extend(VirtualDevice.prototype, {
            create: function(deviceInfo) {
                switch(deviceInfo.currentDeviceType) {
                    case 0:
                        if (!this.virtualDeviceSnapPea) {
                            this.virtualDeviceSnapPea = new WdVirtualDeviceSnapPea(deviceInfo);
                        }
                        
                        this.currentVirtualDevice = this.virtualDeviceSnapPea;
                        break;
                    case 1:
                        if (!this.virtualDeviceCloudBackup) {
                            this.virtualDeviceCloudBackup = new WdVirtualDeviceCloudBackup(deviceInfo);
                        }
                        
                        this.currentVirtualDevice = this.virtualDeviceCloudBackup;
                        break;
                    case 2: 
                        if (!this.virtualDeviceCloudLocker) {
                            this.virtualDeviceCloudLocker = new WdVirtualDeviceCloudLocker(deviceInfo);
                        }
                        
                        this.currentVirtualDevice = this.virtualDeviceCloudLocker;
                        break;
                }

                return this.currentVirtualDevice;
            },

            getCurrentDevice: function() {
                return this.currentVirtualDevice;
            }
        });

        return new VirtualDevice();

        // var currentVirtualDevice;
        // var valid = false;
        // var api = {
        //     init: function(deviceInfo) {
        //         switch(deviceInfo.currentDeviceType) {
        //             case 0:
        //                 currentVirtualDevice = wdVirtualDeviceSnapPea;
        //                 break;
        //             case 1:
        //                 currentVirtualDevice = wdVirtualDeviceCloudBackup;
        //                 break;
        //             case 2: 
        //                 currentVirtualDevice = wdVirtualDeviceCloudLocker;
        //                 break;
        //         }

        //         currentVirtualDevice.init(deviceInfo);

        //         return api;
        //     },

        //     buildConnection: function() {
        //         return currentVirtualDevice.buildConnection()
        //             .then(function() {
        //                 valid = true;
        //             }, function() {
        //                 valid = false;
        //             });
        //     },

        //     shutDownConnection: function() {
        //         return currentVirtualDevice.shutDownConnection();
        //     },

        //     getCurrentDevice: function() {
                
        //     },

        //     valid: function() {
        //         return valid;
        //     },

        //     dev: function() {
        //         return currentVirtualDevice.dev();
        //     },

        //     clearDeviceData: function() {
        //         return currentVirtualDevice.clearDeviceData();
        //     },

        //     getAppsService: function() {
        //         return currentVirtualDevice.getAppsService();
        //     },

        //     getContactsService: function() {
        //         return currentVirtualDevice.getContactsService();
        //     },

        //     getMessagesService: function() {
        //         return currentVirtualDevice.getMessagesService();
        //     },

        //     getPhotosService: function() {
        //         return currentVirtualDevice.getPhotosService();
        //     },

        //     getVideosService: function() {
        //         return currentVirtualDevice.getVideosService();
        //     },

        //     getEbooksService: function() {
        //         return currentVirtualDevice.getEbooksService();
        //     }

        // };

        // return api;
    }];
});