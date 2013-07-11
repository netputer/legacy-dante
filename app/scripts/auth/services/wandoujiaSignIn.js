define( [
  'jquery'
], function(
  $
) {
    'use strict';

return [ '$http','$q','$rootScope', '$log','$window', function ( $http, $q, $rootScope, $log, $window ) {

    var result = {
        getAccount : function() {
            var defer = $q.defer();
            var url = 'https://account.wandoujia.com/v4/api/profile';
            $.ajax({
                type: 'GET',
                url: url,
                async: false,
                contentType: 'application/json',
                dataType: 'jsonp',
                success: function( data ) {
                    defer.resolve( data );
                    $rootScope.$apply();
                },
                error: function(e) {
                    $log.log('需要登陆豌豆荚');
                    defer.reject();
                    $rootScope.$apply();
                }
            });
            return defer.promise;
        }
    };

  return result;
}];
});
