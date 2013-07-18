define([], function() {
'use strict';
return [function() {
    return {
        link: function($scope, $element, $attrs) {
            var event = $attrs.event || 'click';
            var timeout = $attrs.timeout || '1000';
            var listener = function() {
                $element.attr('disabled', true);
                setTimeout(function() {
                    $element.removeAttr('disabled');
                }, timeout);
            };

            $element.on(event, listener);
        }
    };
}];
});
