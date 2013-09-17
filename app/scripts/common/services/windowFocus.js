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
    $(window).on('focus', function() {
        status = true;
    });
    $(window).on('blur', function() {
        status = false;
    });
    return {
        getStatus: function() {
            return status;
        }
    };

//结束
}];
});
