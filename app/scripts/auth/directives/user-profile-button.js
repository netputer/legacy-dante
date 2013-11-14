define([
    'text!templates/auth/user-profile-button.html'
], function(
    template
) {
'use strict';
return ['wdGoogleSignIn', '$window', function(wdGoogleSignIn, $window) {
return {
template: template,
replace: true,
link: function($scope, $element, $attribute, $control) {
    wdGoogleSignIn.getProfileInfo().then(function(data) {
        $scope.profile = data;
    });
    wdGoogleSignIn.getAccount().then(function(data) {
        $scope.profile.email = data;
    });
}

};
}];
});