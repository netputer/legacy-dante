define([
    'text!templates/auth/user-profile-button.html',
    'jquery'
], function(
    template,
    $
) {
'use strict';
return ['wdGoogleSignIn', '$window', '$document', function(wdGoogleSignIn, $window, $document) {
return {
template: template,
scope: true,
replace: true,
link: function($scope, $element, $attribute, $control) {
    $scope.showUserDetail = false;
    $scope.toggleUserProfile = function() {
        $scope.showUserDetail = !$scope.showUserDetail;
        if ($scope.showUserDetail) {
            $($document).one('click', function() {
                $scope.showUserDetail = false;
            });
        }
    };
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