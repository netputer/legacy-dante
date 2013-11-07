define([
    'jquery'
], function(
    $
) {
'use strict';
return ['$window', function($window) {
    
    var defer = $.Deferred();
    function getIframe() {
        var iframe = $('.communicate-snappea-com-iframe')[0];
        if (!iframe) {
            iframe = $('<iframe></iframe>').appendTo('body')
                                           .addClass('communicate-snappea-com-iframe')
                                           .attr('src', 'http://www.snappea.com/post-message.html')
                                           .hide()[0];
            iframe.onload = function() {
                defer.resolve();
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
        defer.done(function() {
            post();
        });
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
