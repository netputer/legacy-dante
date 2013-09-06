define([], function() {
'use strict';
return function() {
    var self = this;
    self.$get = ['$window', '$location', 'wdDev', '$rootScope',
        function($window, $location, wdDev, $rootScope ) {
        var valid = false;
        var signoutDetectionTimer = null;
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
            signout: function() {
                this.clearDevice();
                if (wdDev.query('ac')) {
                    $window.location = $window.location.pathname + '#/portal';
                }
                else {
                    $location.url('/portal');
                }
                $rootScope.$broadcast('signout');
                this.stopSignoutDetection();
            },
            startSignoutDetection: function() {
                var self = this;
                signoutDetectionTimer = setInterval(function() {
                    if (!$window.localStorage.getItem('googleToken')) {
                        self.stopSignoutDetection();
                        $rootScope.$apply(function() {
                            self.signout();
                        });
                    }
                }, 1000);
            },
            stopSignoutDetection: function() {
                clearInterval(signoutDetectionTimer);
            }
        };
    }];
};
});
