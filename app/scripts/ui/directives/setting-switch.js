define([
    'text!templates/ui/setting-switch.html'
], function(
    template
) {
'use strict';
return [function() {
return {
template: template,
replace: true,
require: '?ngModel',
link: function($scope, $element, $attribute, $ngModel) {
    if($ngModel) {
        $ngModel.$render = function() {
            $element.toggleClass('open', $ngModel.$viewValue);
        };

        $element.on('click', function() {
            $scope.$apply(function() {
                $ngModel.$setViewValue(!$ngModel.$viewValue);
                $ngModel.$render();
            });
        });
    } else {
        $element.on('click', function() {
            $element.toggleClass('open');
        });
    }
}
};
}];
});