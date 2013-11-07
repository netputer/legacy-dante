define([
    'jquery'
], function(
    $
) {
'use strict';
return ['$window', function($window) {
    function getIframe() {
        var iframe = $('.communicate-snappea-com-iframe')[0];
        if (!iframe[0]) {
            iframe = $('<iframe></iframe>').appendTo('body')
                                    .addClass('communicate-snappea-com-iframe')
                                    .attr('src', 'http://snappea.com/post-message.html')
                                    .hide()[0];
        }
        return iframe;
    }

    function postMessage(message) {
        getIframe().contentWindow.postMessage({
            command: message
        }, 'http://www.snappea.com'); 
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
