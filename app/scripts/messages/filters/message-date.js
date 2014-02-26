define([
    'moment'
    // 'components/moment/lang/zh-cn.js'
], function(
    moment
    // zhCn
) {
'use strict';
return ['$rootScope', function($rootScope) {
    return function(input, format) {
        input = parseInt(input, 10);
        var startOfYesterday = moment().startOf('day').subtract('days', 1);
        var date = moment(input);
        if (!$rootScope.READ_ONLY_FLAG) {
            moment.lang('en');
        }
        if (date.isAfter(startOfYesterday)) {
            return date.fromNow();
        }
        else {
            return date.format(format);
        }
    };
}];
});
