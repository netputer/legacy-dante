define([
    'text!templates/ui/checkbox.html'
], function(
    template
) {
'use strict';
return [function() {
    var uid = (function(count, prefix) {
        return function() {
            count += 1;
            return prefix + count;
        };
    })(0, '--wd-checkbox-');

    return {
        require: '?ngModel',
        template: template,
        replace: true,
        // scope: true,
        link: function($scope, $element, $attrs, ngModel) {
            var id = uid();
            var checkbox = $element.children('input[type=checkbox]');

            if (ngModel) {
                // link
                checkbox.attr('id', id);
                $element.attr('for', id);

                checkbox.on('click', function(e) {
                    e.stopPropagation();
                });

                // proxy disabled, name
                $attrs.$observe('disabled', function(value) {
                    checkbox.prop('disabled', value);
                });
                // proxy name
                $attrs.$observe('name', function(value) {
                    checkbox.attr('name', value);
                });

                ngModel.$render = function() {
                    checkbox.prop('checked', !!ngModel.$viewValue);
                    $attrs.$set('checked', !!ngModel.$viewValue);
                };

                checkbox.on('change', function() {
                    $scope.$apply(function() {
                        var value = checkbox.prop('checked');
                        ngModel.$setViewValue(value);
                        $attrs.$set('checked', value);
                    });
                });

                ngModel.$render();
            } else {
                checkbox.detach();
            }

            $element.on('$destory', function() {
                checkbox.remove();
                checkbox = null;
            });
        }
    };
}];
});
