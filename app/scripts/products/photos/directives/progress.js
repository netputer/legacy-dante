define([
    'text!templates/photos/progress.html',
    'underscore'
], function(
    template,
    _
) {
'use strict';
return [function() {
    return {
        template: template,
        replace: true,
        restrict: 'CA',
        link: function(scope, element) {
            // Element caches.
            var bar = element.children('[data-bar]');
            var done = bar.children('[data-done]');
            var failed = bar.children('[data-failed]');
            var btnCancel = element.children('.cancel');

            var promise = scope.photo.deferred;

            if (!promise) { return; }

            scope.cancel = function() {
                scope.cancelUpload();
            };
            scope.retry = function() {
                failed.hide();
                bar.css({
                    scale: [0, 1],
                    height: 9,
                    background: '#6eb800'
                });
                scope.retryUpload();
            };

            promise
                .progress(function(report) {
                    _.defer(function() {
                        if (report.status === 'uploading') {
                            bar.css('scale', [report.percent / 100, 1]);
                        }
                        if (report.status === 'failed') {
                            bar.css({
                                scale: [1, 1],
                                height: 20,
                                background: '#a00'
                            });
                            failed.fadeIn();
                        }

                    });
                })
                .done(function() {
                    bar.css({
                        scale: [1, 1],
                        height: 20
                    });
                    btnCancel.fadeOut('fast');
                    done.fadeIn();
                    delete scope.photo.deferred;
                });
            // Initialize
            done.hide();
            failed.hide();
        }
    };
}];
});
