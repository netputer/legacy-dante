define([], function() {
	'use strict';
	return ['GA', function(GA) {
		var data = {};

		return {
			track: function(vertical) {
				var duration = Date.now() - data[vertical].enterTimestamp;
                var times = data[vertical].times === 1 ? 'first' : 'again';

                GA('perf:' + vertical + '_interactive_duration:' + times + ':' + duration);
			},

			count: function(vertical) {
				if (!data[vertical]) {
					data[vertical] = {};
					data[vertical].times = 1;
				} else {
					data[vertical].times += 1;
				}
				
				data[vertical].enterTimestamp = Date.now();
				
            }
		};
	}];
});