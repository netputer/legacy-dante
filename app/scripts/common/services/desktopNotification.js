define([
], function(
) {
    'use strict';
return ['$window', '$timeout',
function($window, $timeout) {

    var notification;
    var ICON_LIST = {
        message: 'http://web.snappea.com/message-notification-icon.png'
    };
    return {
        checkSupport: function() {
            if (window.webkitNotifications) {
                return true;
            } else if (window.Notification) {
                return true;
            } else {
                return false;
            }
        },
        checkPermission: function () {
            if (this.checkSupport()) {
                if (window.webkitNotifications) {
                    if (window.webkitNotifications.checkPermission() === 0) {
                        return true;
                    } else {
                        window.webkitNotifications.requestPermission();
                    }
                } else if (window.Notification) {
                    if (window.Notification.permission === 'granted') {
                        return true;
                    } else {
                        window.Notification.requestPermission();
                    }
                } else {
                    return false;
                }
            }
        },
        show: function (iconName, title, context, isAutoClose) {
            var me = this;
            var icon = ICON_LIST[iconName];
            isAutoClose = isAutoClose || true;
            if (this.checkPermission()) {
                if (window.webkitNotifications) {
                    notification = window.webkitNotifications.createNotification(icon, title, context);
                } else if (window.Notification) {
                    notification = new window.Notification(title, { icon: icon, body: context });
                }
                notification.show();
            }
            if (isAutoClose) {
                setTimeout(function() {
                    me.close();
                }, 5000);
            }
            return this;
        },
        close: function () {
            if (notification) {
                notification.close();
                notification = null;
            }
            return this;
        }
    };
//结束
}];
});
