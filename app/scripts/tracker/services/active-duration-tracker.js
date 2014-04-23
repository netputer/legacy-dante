define([], function() {
    'use strict';
    return ['GA', function(GA) {
        var END = 'end';
        var ACTIVE = 'active';
        var START = 'start';
        var status = ACTIVE;
        var currentVertical = '';
        var timestamp = 0;
        var webAPPFirstTimestamp = Date.now();
        var durationPool = {};

        function log(vertical) {
            var duration = Date.now() - timestamp;
            GA('perf:active:' + currentVertical + '_duration:' + duration);

            
            if (!durationPool[currentVertical]) {
                durationPool[currentVertical] = duration;
            } else {
                durationPool[currentVertical] += duration;
            }
            
            if (vertical === END) {
                var webAPPDuration = Date.now() - webAPPFirstTimestamp;
                GA('perf:active:webAPP:' + webAPPDuration);

                for(var i in durationPool) {
                    GA('perf:active:' + i + '_in_webAPPLife_duration:' + durationPool[i]);
                }

                durationPool = {};
            }

            currentVertical = vertical !== END ? vertical : currentVertical;
            timestamp = Date.now();
        }

        return {
            track: function(vertical) {
                if (!currentVertical.length) {
                    currentVertical = vertical;
                    timestamp = Date.now();
                } else if (currentVertical !== vertical && status !== 'end') {
                    if (status === START) {
                        currentVertical = vertical;
                        timestamp = Date.now();
                    } else {
                        log(vertical);
                    }
                    
                    status = ACTIVE;
                }
                
            },

            endActive: function() {
                log(END);
                status = END;
            },

            startActive: function() {
                if (status === END) {
                    timestamp = Date.now();
                    webAPPFirstTimestamp = Date.now();
                    status = START;
                }
            }
        };

        
    }];
});