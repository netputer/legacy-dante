define([
    'underscore'
    ], function(
    _
    ) {
    'use strict';
    return ['$q',
    function($q) {
        function APP(dataChannel) {
            this.list = [];
            this.installedList = [];

            _.extend(this, dataChannel);
        }

        _.extend(APP.prototype, {
            getAppList: function(parameters) {
                if (this.list.length) {
                    var defer = $q.defer();
                    defer.resolve(this.list);
                    return defer.promise;
                } else {
                    return this.http({
                        method: 'get',
                        url: '/resource/apps?length=9999',
                        data: parameters || {}
                    }).then(function(response) {
                        var formatedData = _.map(response.data, this.format);
                        return formatedData;
                    }.bind(this));
                }
                
            },

            delete: function(packageName) {
                return this.http({
                    method: 'delete',
                    url: '/resource/apps/' + packageName
                });
            },

            install: function(apkPaths) {
                return this.http({
                    method: 'post',
                    url: '/resource/apps/install',
                    data: apkPaths
                });
            },

            getApp: function(packageName) {
                return this.http({
                    method: 'get',
                    url: '/resource/apps/'+ packageName
                });
            },

            clearData: function() {
                this.list = [];
                this.installedList = [];
            },

            setInstalledList: function(list) {
                this.installedList = list;
            },

            getInstalledList: function() {
                return this.installedList;
            },

            format: function(data) {
                data['apk_size'] = Number(data['apk_size']/1024/1024).toFixed(2);
                
                switch (data['installed_location']) {
                    case 1:
                        data['installed_location'] = 'Phone memory';
                    break;
                    case 2:
                        data['installed_location'] = 'SD card';
                    break;
                }

                data['confirmTipShow'] = false;
                data['doneTipShow'] = false;
                data['checked'] = false;
                
                return data;
            }
        });

        return APP;
    }];
});