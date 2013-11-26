define([
    'text!templates/auth/user-profile-button.html',
    'jquery'
], function(
    template,
    $
) {
'use strict';
return ['wdGoogleSignIn', '$window', '$document', '$q', function(wdGoogleSignIn, $window, $document, $q) {
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

    function getUserInfo() {
        wdGoogleSignIn.refreshToken(true).then(function() {
            return wdGoogleSignIn.getProfileInfo();
        }).then(function(data) {
            $scope.profile = data;
            return wdGoogleSignIn.getAccount();
        }).then(function(data) {
            $scope.profile = $scope.profile || {};
            $scope.profile.email = data;
        }, function() {
            getUserInfo();
        });
    }

    getUserInfo();
}

};
}];
});