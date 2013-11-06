define([
    'underscore'
], function(
    _
) {
'use strict';
return ['$window', function($window) {

    function postMessage(message) {
        var iframes = $window.document.querySelectorAll('.communicate-snappea-com');
        _.each(iframes,function(i) {
            i.contentWindow.postMessage({
                command: message
            }, 'http://snappea.com'); 
        });
    }

    return {
        googleSignIn: function() {
            postMessage('google-sign-in');
        },
        googleSignOut: function() {
            postMessage('google-sign-out');
        }
    };
}];
});
