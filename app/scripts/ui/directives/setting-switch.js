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

    $ngModel.$render = function() {
        $element.toggleClass('open', $ngModel.$viewValue);
    };

    $element.on('click', function() {
        $scope.$apply(function() {
            $ngModel.$setViewValue(!$ngModel.$viewValue);
            $ngModel.$render();
        });
    });

}
};
}];
});