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
                    $rootScope.$apply(function(){
                        defer.resolve( data );
                    });
                },
                error: function(e) {
                    $log.log('Need login in wandoujia.');
                    $rootScope.$apply(function(){
                        defer.reject();
                    });
                }
            });
            return defer.promise;
        }
    };

  return result;
}];
});
