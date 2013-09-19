define([
], function(
) {
'use strict';
return ['$window', '$timeout',
function($window, $timeout) {

    var ICON_LIST = {
        MESSAGE_ICON: 'http://web.snappea.com/message-notification-icon.png'
    };
    var notification;
    var hasPermitted = 'none';

    return {
        checkSupport: function() {
            if ($window.Notification) {
                return true;
            } else {
                return false;
            }
        },
        checkPermission: function () {
            if (this.checkSupport()) {
                $window.Notification.requestPermission(function(permission) {
                    if (permission === 'granted') {
                        hasPermitted = 'yes';
                    } else {
                        hasPermitted = 'no';
                    }
                });
            }
        },
        show: function (icon, title, context, isAutoClose) {
            var me = this;
            if (hasPermitted === 'yes') {
                notification = new $window.Notification(title, { icon: icon, body: context });
                if (isAutoClose) {
                    setTimeout(function() {
                        me.close();
                    }, 5000);
                }
            }
            return this;
        },
        close: function () {
            if (notification) {
                notification.close();
                notification = null;
            }
            return this;
        },
        showNewMessage: function (title, context) {
            this.show(ICON_LIST.MESSAGE_ICON, title, context, true);
        }
    };
//结束
}];
});
