define([
    'jquery'
], function(
    $
) {
'use strict';
return ['$window', function($window) {
    
    var isIframeOnLoad = false;
    function getIframe() {
        var iframe = $('.communicate-snappea-com-iframe')[0];
        if (!iframe) {
            isIframeOnLoad = false;
            iframe = $('<iframe></iframe>').appendTo('body')
                                           .addClass('communicate-snappea-com-iframe')
                                           .attr('src', 'http://www.snappea.com/post-message.html')
                                           .hide()[0];
            iframe.onload = function() {
                isIframeOnLoad = true;
            };
        }
        return iframe;
    }

    function postMessage(message) {
        var win = getIframe().contentWindow;
        function post() {
            win.postMessage({
                command: message
            }, 'http://www.snappea.com'); 
        }
        if (isIframeOnLoad) {
            post();
        } else {
            win.onload = function() {
                post();
            };
        }
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
