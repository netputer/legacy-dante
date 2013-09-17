define([], function() {
'use strict';
return ['$window', function($window) {

    var status = true;

    return {
        init: function() {
            window.onfocus = function () {
                status = true;
            };
            window.onblur = function () {
                status = false;
            };        
        },
        getStatus: function() {
            return status;
        }
    };

//结束
}];
});
