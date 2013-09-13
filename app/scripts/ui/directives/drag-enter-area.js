define([
        'text!templates/ui/drag-enter-area.html'
    ], function(
        template
    ) {
'use strict';
return [function() {
    return {
        template: template,
        scope: true,
        link: function(scope, element, attributes) {
            var $title = element.find('.drag-enter-title');
            var $tip = element.find('.drag-enter-tip');

            attributes.$observe('title', function(title) {
                $title.text(title);
            });

            attributes.$observe('tip', function(tip) {
                $tip.text(tip);
            });
        }
    };
}];
});
