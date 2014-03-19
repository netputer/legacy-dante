define( [
  'jquery'
], function(
  $
) {
    'use strict';

return [ '$http','$q','$rootScope', '$log','$window', function ( $http, $q, $rootScope, $log, $window ) {
    var userProfile;
    var result = {
        checkAuthStatus: function() {
            var defer = $q.defer();
            var url = 'https://account.wandoujia.com/v4/api/profile';
            $.ajax({
                type: 'GET',
                url: url,
                async: false,
                contentType: 'application/json',
                dataType: 'jsonp',
                success: function( data ) {
                    $rootScope.$apply(function(){
                        if (data.error === 0) {
                            userProfile = data.member;
                            defer.resolve(data.member);
                        } else {
                            defer.reject(data);
                        }
                    });
                },
                error: function(e) {
                    $log.log('Wandoujia server error.');
                    $rootScope.$apply(function(){
                        defer.reject();
                    });
                }
            });
            return defer.promise;
        },
        getProfile: function() {
            var defer = $q.defer();
            if (userProfile) {
                defer.resolve(userProfile);
            } else {
                this.checkAuthStatus().then(function(data){
                    defer.resolve(data);
                }, function(data){
                    defer.reject(data);
                });
            }
            return defer.promise;
        },
        getSignOutUrl: function() {
            var SIGN_OUT_URL = 'https://account.wandoujia.com/v1/user/?do=logout&callback=';
            var url = SIGN_OUT_URL + encodeURIComponent('http://www.wandoujia.com/cloud');
            return url;
        }
    };

  return result;
}];
});
