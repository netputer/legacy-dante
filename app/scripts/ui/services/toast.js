define([
    'text!templates/ui/toast.html',
    'jquery'
], function(
    template,
    $
) {
'use strict';
return [function() {

    var BLOCK_EVENTS = [
        'keyup',
        'keydown',
        'keypress'
    ];

    function blocker(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    var toast = {
        el: null,
        open: function(content) {
            if (!this.el) {
                this.el = $(template).appendTo(document.body);
            }

            this.el.removeClass('toast-error');
            this.el.find('.content').html(content).end().show();
            this.el.find('.toast-inner').stop()
                .css({
                    scale: 0,
                    opacity: 0
                })
                .transition({
                    scale: 1,
                    opacity: 1
                }, 200);

            BLOCK_EVENTS.forEach(function(event) {
                document.addEventListener(event, blocker, true);
            });
        },
        close: function(reason) {
            var el = this.el;
            var inner = this.el.find('.toast-inner').stop();

            if (reason) {
                this.el.addClass('toast-error').find('.content').html(reason);
                inner.delay(1500);
            }

            inner.transition({ opacity: 0 }, 50).promise().then(function() {
                el.hide();
            });

            BLOCK_EVENTS.forEach(function(event) {
                document.removeEventListener(event, blocker, true);
            });
        }
    };

    return {
        /**
         * Open a Toast
         * @param  {Promise} promise A promise has a prop content, rejected with reason.
         * @return {Promise}
         */
        apply: function(promise) {
            toast.open(promise.content || '');
            return promise.then(function() {
                toast.close();
            }, function(reason) {
                toast.close(reason);
            });
        }
    };
}];
});
