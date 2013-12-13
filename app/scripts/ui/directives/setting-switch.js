define([
    'text!templates/ui/setting-switch.html'
], function(
    template
) {
'use strict';
return ['$timeout', function($timeout) {
return {
template: template,
scope: true,
replace: true,
link: function($scope, $element, $attribute, $control) {

    var settingStatus;
    if ($attribute.defaultSwitch === 'true') {
        settingStatus = true;
    } else {
        settingStatus = false;
    }
    changeClassName();

    $element.on('click', function() {
        settingStatus = !settingStatus;
        changeClassName();
    });

    function changeClassName() {
        if(settingStatus) {
            $element.addClass('open');
        } else {
            $element.removeClass('open');
        }
    }

}
};
}];
});