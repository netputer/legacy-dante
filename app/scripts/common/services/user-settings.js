define([], function() {
'use strict';
return ['$window', function($window) {
    return {

        // 新消息声音设置
        incomingMessageSoundEnabled: function(value) {
            if (arguments.length > 0) {
                $window.localStorage.setItem('messageSoundOpen', value);
            } else {
                return $window.localStorage.getItem('messageSoundOpen') !== 'false';
            }
        }

    };
}];
});
