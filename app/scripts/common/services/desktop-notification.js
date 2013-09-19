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
    var hasPermitted = false;
    var result = {
        checkSupport: function() {
            if ($window.webkitNotifications) {
                return true;
            } else if ($window.Notification) {
                return true;
            } else {
                return false;
            }
        },
        checkPermission: function () {
            var me = this;
            if (this.checkSupport()) {
                if ($window.webkitNotifications && $window.webkitNotifications.checkPermission) {
                    if ($window.webkitNotifications.checkPermission() === 0) {
                        hasPermitted = true;
                    } else {
                        me.requestPermission();
                    }
                }

                if ($window.Notification && $window.Notification.permission) {
                    if ($window.Notification.permission === 'granted') {
                        hasPermitted = true;
                    } else {
                        me.requestPermission();
                    }
                }
            }
        },
        requestPermission: function() {
            if ($window.webkitNotifications) {
                window.webkitNotifications.requestPermission();
            } else if ($window.Notification) {
                $window.Notification.requestPermission();
            }
        },
        show: function (icon, title, context, isAutoClose) {
            var me = this;
            if (hasPermitted === true) {
                if ($window.Notification) {
                    notification = new $window.Notification(title, { icon: icon, body: context });
                }

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

    //进入系统时提示获取授权，如果未授权会申请用户授权。
    result.checkPermission();
    return result;
//结束
}];
});
