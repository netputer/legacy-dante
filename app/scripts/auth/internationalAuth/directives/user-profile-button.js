define([
    'text!templates/auth/user-profile-button.html',
    'jquery'
], function(
    template,
    $
) {
'use strict';
return ['wdInternationalAuth', '$window', '$document', '$q', '$timeout', function(wdInternationalAuth, $window, $document, $q, $timeout) {
return {
template: template,
scope: true,
replace: true,
link: function($scope, $element, $attribute, $control) {
    $scope.showUserDetail = false;
    var MAX_RETRY_TIMES = 3;
    var retryNum = 0;
    $scope.toggleUserProfile = function() {
        $scope.showUserDetail = !$scope.showUserDetail;
        if ($scope.showUserDetail) {
            $($document).one('click', function() {
                $scope.showUserDetail = false;
                $scope.$apply();
            });
        }
    };

    function getUserInfo() {
        wdInternationalAuth.getProfile().then(function(data) {
            $scope.profile = data;
        }, function() {
            $timeout(function() {
                retryNum += 1;
                if (retryNum <= MAX_RETRY_TIMES) {
                    getUserInfo();
                }
            }, 500);
        });
    }

    getUserInfo();
}

};
}];
});