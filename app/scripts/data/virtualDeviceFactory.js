define([
    'underscore'
    ], function(
    _
    ) {
    'use strict';
    return ['wdCloudLockerVirtualDevice', 'wdCloudBackupVirtualDevice', 'wdSnapPeaVirtualDevice',
    function(WdCloudLockerVirtualDevice,   WdCloudBackupVirtualDevice,   WdSnapPeaVirtualDevice) {

        function VirtualDevice() {
            this.currentVirtualDevice = null;

            this.snapPeaVirtualDevice = null;
            this.cloudBackupVirtualDevice = null;
            this.cloudLockerVirtualDevice = null;
        }

        _.extend(VirtualDevice.prototype, {
            create: function(deviceInfo) {
                switch(deviceInfo.currentDeviceType) {
                    case 0:
                        if (!this.snapPeaVirtualDevice) {
                            this.snapPeaVirtualDevice = new WdSnapPeaVirtualDevice(deviceInfo);
                        }
                        
                        this.currentVirtualDevice = this.snapPeaVirtualDevice;
                        break;
                    case 1:
                        if (!this.cloudBackupVirtualDevice) {
                            this.cloudBackupVirtualDevice = new WdCloudBackupVirtualDevice(deviceInfo);
                        }
                        
                        this.currentVirtualDevice = this.cloudBackupVirtualDevice;
                        break;
                    case 2: 
                        if (!this.cloudLockerVirtualDevice) {
                            this.cloudLockerVirtualDevice = new WdCloudLockerVirtualDevice(deviceInfo);
                        }
                        
                        this.currentVirtualDevice = this.cloudLockerVirtualDevice;
                        break;
                }

                return this.currentVirtualDevice;
            },

            getCurrentDevice: function() {
                return this.currentVirtualDevice;
            }
        });

        return new VirtualDevice();
    }];
});