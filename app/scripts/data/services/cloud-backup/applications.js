define([
    'underscore'
    ], function(
    _
    ) {
    'use strict';
    return[ 'wdAppsService', 'wdBackupChannelDev',
    function(WdAppsService,   wdBackupChannelDev) {

        function App() {
            this.list = [];
            this.installedList = [];
        }

        var wdAppsService = new WdAppsService(wdBackupChannelDev);
        
        _.extend(App.prototype, wdAppsService);

        return new App();
    }];
});