define([
    'jquery'
], function(
    $
) {
'use strict';
return [
'$window',
function($window) {
    var status = true;
    return {
        initialize: function() {
            $(window).on('focus', function() {
                status = true;
            });
            $(window).on('blur', function() {
                status = false;
            });
        },
        getStatus: function() {
            return status;
        }
    };

//结束
}];
});
