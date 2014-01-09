define([
    'jquery'
], function(
    $
) {
'use strict';
return function() {
    var self = this;
    self.$get = ['$window', '$location', 'wdDev', '$rootScope',
        function($window,    $location,   wdDev,   $rootScope) {
        var valid = false;
        return {
            valid: function() {
                return valid;
            },
            getDevice: function() {
                var data;
                try {
                    data = JSON.parse($window.localStorage.getItem('currentDevice'));
                }
                catch (e) {
                    data = null;
                }
                return data;
            },
            setDevice: function(data) {
                $window.localStorage.setItem('currentDevice', JSON.stringify(data) );
                valid = true;
            },
            clearDevice: function() {
                $window.localStorage.removeItem('currentDevice');
                valid = false;
            },
            
            //从设备退出到设备列表
            signout: function() {
                this.setDevice({status:'devices'});
                if (wdDev.query('ac')) {
                    $window.location = $window.location.pathname + '#/portal';
                } else {
                    $location.url('/portal');
                }
                $rootScope.$broadcast('signout');
            },

            // 远程点亮一台手机
            lightDeviceScreen: function(deviceId) {
                var url = 'https://push.snappea.com/accept?data=d2FrZV91cA==';
                $.ajax({
                    type: 'GET',
                    url: url,
                    dataType: 'jsonp',
                    data: {
                        did: deviceId
                    }
                });
            }

        };
    }];
};
});
