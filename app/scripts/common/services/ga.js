define([], function() {
'use strict';
return ['$log', '$interval', '$injector', function($log, $interval, $injector) {
    var counter, lastCounter, times;

    var resetData = function() {
        counter = 0;
        lastCounter = 0;
        times = 0;
    };

    var listenUserGone = function() {
        var timeSpan = 1000;
        var maxDuration = 60 * 5;

        var timer = $interval(function() {
            if (lastCounter !== counter) {
                lastCounter = counter;
            } else {
                times += 1;
                if (times >= maxDuration) {
                    $injector.invoke(['wdActiveDurationTracker', '$location', function(wdActiveDurationTracker, $location) {
                        var vertical = $location.path().replace('/', '');

                        wdActiveDurationTracker.endActive();
                    }]);

                    resetData();
                    $interval.cancel(timer);
                }
            }
            
        }, 1000);
    };
    

    resetData();

    return function(params) {
        params = params.split(':');
        if (params.length >= 4) {
            params[3] = parseInt(params[3], 10);
        }
        $log.log('GA:', ['_trackEvent'].concat(params));
        window._gaq.push(['_trackEvent'].concat(params));

        counter += 1;

        if (counter === 1) {
            listenUserGone();

            $injector.invoke(['wdActiveDurationTracker', function(wdActiveDurationTracker) {
                wdActiveDurationTracker.startActive();
            }]);
        }
    };
}];
});