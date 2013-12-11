define([
    'text!templates/common/setting-switch.html'
], function(
    template
) {
'use strict';
return ['$timeout', function($timeout) {
return {
template: template,
scope: true,
replace: false,
link: function($scope, $element, $attribute, $control) {
    $element.addClass('wd-setting-switch');
    var settingSwitch;
    
    function checkAttr() {
        if ($element.attr('default-switch') === 'true') {
            settingSwitch = true;
            changeClassName();
        } else if ($element.attr('default-switch') === 'false') {
            settingSwitch = false;
            changeClassName();
        } else {
            $timeout(function() {
                checkAttr();
            }, 10);
        }
    }

    $element.on('click', function() {
        settingSwitch = !settingSwitch;
        changeClassName();
    });

    function changeClassName() {
        if (settingSwitch) {
            $element.addClass('open');
        } else {
            $element.removeClass('open');
        }
    }

    checkAttr();
}
};
}];
});