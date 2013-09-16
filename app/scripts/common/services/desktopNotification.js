define([
], function(
) {
    'use strict';
return ['$window',
function($window) {

    var item;
    return {
        show: function (icon, title, context) {
            if (this.checkPermission()) {
                item = window.webkitNotifications.createNotification(icon, title, context);
                item.show();
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
