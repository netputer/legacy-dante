define([
], function(
) {
'use strict';
return ['$window', '$timeout', '$rootScope',
function($window,   $timeout,   $rootScope) {

    var ICON_LIST = {
        MESSAGE_ICON: 'http://web.snappea.com/message-notification-icon.png'
    };
    var notification;
    var hasPermitted = false;
    var result = {
        checkSupport: function() {
            if ($window.Notification) {
                return true;
            } else if ($window.webkitNotifications) {
                return true;
            } else {
                return false;
            }
        },
        checkPermission: function () {
            var me = this;
            if (this.checkSupport()) {
                if ($window.Notification && $window.Notification.permission) {
                    if ($window.Notification.permission === 'granted') {
                        hasPermitted = true;
                        return true;
                    } else {
                        return false;
                    }
                }
                if ($window.Notification && $window.Notification.permissionLevel) {
                    if ($window.Notification.permissionLevel() === 'granted') {
                        hasPermitted = true;
                        return true;
                    } else {
                        return false;
                    }
                }
                if ($window.webkitNotifications && $window.webkitNotifications.checkPermission) {
                    if ($window.webkitNotifications.checkPermission() === 0) {
                        hasPermitted = true;
                        return true;
                    } else {
                        return false;
                    }
                }
            }
        },
        requestPermission: function() {
            if (this.checkSupport() || hasPermitted === false) {
                if ($window.webkitNotifications) {
                    $window.webkitNotifications.requestPermission();
                } else if ($window.Notification) {
                    // Safari started supporting notification with Safari 6 but only on Mac OSX 10.8+ (Mountain Lion)
                    $window.Notification.requestPermission();
                }
            }
        },
        show: function (icon, title, context, onClick, isAutoClose) {
            var me = this;
            if (this.checkSupport() && this.checkPermission()) {
                if ($window.Notification) {
                    notification = new $window.Notification(title, { icon: icon, body: context });
                    notification.onclick = function(e) {
                        $rootScope.$apply(function() {
                            onClick.call(null, e, notification);
                        });
                    };
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
        showNewMessage: function (title, context, onClick) {
            this.show(ICON_LIST.MESSAGE_ICON, title, context, onClick, true);
        }
    };

    //进入系统时提示获取授权，如果未授权会申请用户授权。

    result.requestPermission();
    return result;
//结束
}];
});
