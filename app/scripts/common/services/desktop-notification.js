define([
], function(
) {
    'use strict';
return ['$window', '$timeout', '$q',
function($window, $timeout, $q) {

    var notification;
    var ICON_LIST = {
        MESSAGE_ICON: 'http://web.snappea.com/message-notification-icon.png'
    };
    return {
        checkSupport: function() {
            if (window.Notification) {
                return true;
            } else {
                return false;
            }
        },
        checkPermission: function () {
            var defer = $q.defer();
            if (this.checkSupport()) {
                window.Notification.requestPermission(function(permission) {
                    if (permission === 'granted') {
                        defer.resolve();
                    } else {
                        defer.reject();
                    }
                });
            } else {
                defer.reject();
            }
            return defer.promise;
        },
        show: function (icon, title, context, isAutoClose) {
            var me = this;
            this.checkPermission().then(function(){
                notification = new window.Notification(title, { icon: icon, body: context });
                if (isAutoClose) {
                    setTimeout(function() {
                        me.close();
                    }, 5000);
                }
            });
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
