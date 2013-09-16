define([
], function(
) {
    'use strict';
return ['$window', '$timeout',
function($window, $timeout) {

    var item;
    return {
        show: function (icon, title, context, isAutoClose) {
            var me = this;
            isAutoClose = isAutoClose || true;
            if (this.checkPermission()) {
                item = window.webkitNotifications.createNotification(icon, title, context);
                item.show();
            }
            if( isAutoClose ) {
                $timeout(function() {
                    me.close();
                }, 5000);
            }
            return this;
        },
        close: function () {
            if (item) {
                item.close();
            }
            return this;
        },
        checkPermission: function () {
            if (window.webkitNotifications.checkPermission() === 0) {
                return true;
            } else {
                window.webkitNotifications.requestPermission();
                return false;
            }
        },
        click: function (fun) {
            item.onclick = fun;
            return this;
        }
    };
//结束
}];
});
