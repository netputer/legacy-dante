define([], function() {
'use strict';
return [function() {

    return {
        require: '^wdNavbar',
        link: function($scope, $element, $attrs, $controller) {
            $scope.$watch('currentModule', function(module) {
                $element.toggleClass('active', module === $attrs.wdNavItem);
                if (module === $attrs.wdNavItem) {
                    $controller.highlightMoveTo($element.offset());
                }
            });
        }
    };

}];
});
