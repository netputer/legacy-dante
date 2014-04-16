define([
    'underscore'
    ], function(
    _
    ) {
    'use strict';

    return ['wdBackupChannelDev', '$q', 'wdBackupAppsService', 'wdBackupContactsService', 'wdBackupMessagesService',
            'wdBackupPhotosService', 'wdBackupVideosService',  'wdBackupEbooksService',
    function(wdBackupChannelDev,   $q,   wdBackupAppsService,   wdBackupContactsService,   wdBackupMessagesService, 
             wdBackupPhotosService,   wdBackupVideosService,    wdBackupEbooksService
        ) {

        function VirtaulDevice(deviceInfo) {
            wdBackupChannelDev.setServer(deviceInfo.ip, deviceInfo.port);

            // set a huge verison code for turning off version control
            wdBackupChannelDev.setMeta({
                 version_code : 9999
            });

            this.device = deviceInfo;
            this.valid = false;

            wdBackupMessagesService.initialize();
        }

        _.extend(VirtaulDevice.prototype, {
            buildConnection: function() {
                var defer = $q.defer();
                defer.resolve();
                this.valid = true;
                return defer.promise;
            },

            shutDownConnection: function() {
                var defer = $q.defer();
                defer.resolve();
                this.valid = false;
                return defer.promise;
            },

            dev: function() {
                return wdBackupChannelDev;
            },

            getCurrentDevice: function() {
                return this.device;
            },

            clearDeviceData: function() {
                wdBackupAppsService.clearData();
                wdBackupMessagesService.clearData();
                wdBackupPhotosService.clearData();
                wdBackupContactsService.clearData();
            },

            getAppsService: function() {
                return wdBackupAppsService;
            },

            getMessagesService: function() {
                return wdBackupMessagesService;
            },

            getPhotosService: function() {
                return wdBackupPhotosService;
            },

            getContactsService: function() {
                return wdBackupContactsService;
            },

            getVideosService: function() {
                return wdBackupVideosService;
            },

            getEbooksService: function() {
                return wdBackupEbooksService;
            }
        });

        return VirtaulDevice;

        // var device;
        // var app;

        // var api = {
        //     init: function(deviceInfo) {
        //         wdBackupChannelDev.setServer(deviceInfo.ip, deviceInfo.port);

        //         // set a huge verison code for turning off version control
        //         wdBackupChannelDev.setMeta({
        //              version_code : 9999
        //         });

        //         device = deviceInfo;

        //         wdBackupMessagesService.initialize();
        //     },

            

        // };

        // return api;
    }];
});