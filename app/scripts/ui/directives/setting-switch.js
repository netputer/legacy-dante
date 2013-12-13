define([
    'text!templates/ui/setting-switch.html'
], function(
    template
) {
'use strict';
return [function() {
return {
template: template,
scope: true,
replace: true,
require: '?ngModel',
link: function($scope, $element, $attribute, $ngModel) {

    $ngModel.$render = function() {
        changeClass($ngModel.$viewValue);
    };

    function changeClass(status) {
        if (status) {
            $element.addClass('open');
            $ngModel.$setViewValue(true);           
        } else {
            $element.removeClass('open');
            $ngModel.$setViewValue(false);
        }
    }

    $element.on('click', function() {
        $ngModel.$setViewValue(!$ngModel.$viewValue);
        $ngModel.$render();
    });
}
};
}];
});