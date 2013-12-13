define([], function() {
'use strict';
return ['$window', function($window) {
    return {

        // 新消息声音设置
        receiveMessageSoundSetting: function(value) {
            if (arguments.length > 0) {
                $window.localStorage.setItem('messageSoundOpen', value);
            } else {
                if ($window.localStorage.getItem('messageSoundOpen') !== 'false') {
                    return true;
                } else {
                    return false;
                }
            }
        }

    };
}];
});
