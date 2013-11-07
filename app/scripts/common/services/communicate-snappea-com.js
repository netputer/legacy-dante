define([
    'jquery'
], function(
    $
) {
'use strict';
return ['$window', function($window) {
    function getIframe() {
        var iframe = $('.communicate-snappea-com-iframe')[0];
        if (!iframe) {
            iframe = $('<iframe></iframe>').appendTo('body')
                                    .addClass('communicate-snappea-com-iframe')
                                    .attr('src', 'http://www.snappea.com/post-message.html')
                                    .hide()[0];
        }
        return iframe;
    }

    function postMessage(message) {
        getIframe().contentWindow.postMessage({
            command: message
        }, 'http://www.snappea.com'); 
    }

    getIframe();
    
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
