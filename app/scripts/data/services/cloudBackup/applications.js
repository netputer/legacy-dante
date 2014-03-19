define([
    'underscore'
    ], function(
    _
    ) {
    'use strict';
    return[ 'wdAppsService',
    function(WdAppsService) {

        function App() {
            this.list = [];
            this.installedList = [];
        }

        var wdAppsService = new WdAppsService();
        _.extend(App.prototype, wdAppsService);

        return new App();
    }];
});