define([
    'jquery'
], function(
    $
) {
'use strict';
return ['$q', '$rootScope', '$log', '$window', function($q, $rootScope, $log, $window) {
return {
    checkToken: function() {
        var defer = $q.defer();
        var token =  $window.localStorage.getItem('googleToken');
        var url = 'https://www.googleapis.com/oauth2/v3/userinfo?access_token=' + token;
        $.ajax({
            type: 'GET',
            url: url,
            async: false,
            contentType: 'application/json',
            dataType: 'jsonp',
            timeout: 10000
        }).done(function(data) {
            $rootScope.$apply(function() {
                if (!data || (data && data.error)) {
                    defer.reject();
                } else {
                    defer.resolve();
                }
            });
        }).fail(function(xhr) {
            defer.reject();
        });
        return defer.promise;
    },

    revoke: function() {
        var defer = $q.defer();
        var token =  $window.localStorage.getItem('googleToken');
        var revokeUrl = 'https://accounts.google.com/o/oauth2/revoke?token=' + token;
        $.ajax({
            type: 'get',
            url: revokeUrl,
            async: false,
            contentType: 'application/json',
            dataType: 'jsonp',
            timeout: 7000,
            success: function(nullResponse) {
                $rootScope.$apply(function() {
                    $log.error('google revoke successed.');
                    defer.resolve();
                });
            },
            error: function(e) {
                $rootScope.$apply(function() {
                    $log.error('google revoke failed.');
                    defer.reject();
                });
            }
        });
        return defer.promise;   
    },

    getLocalProfile: function() {
        // 这里是为了兼容 Google 目前不支持多账号的问题，所以增加的将用户数据存在本地的逻辑
        var localData = JSON.parse($window.localStorage.getItem('userProfile'));
        if (localData) {
            return localData;
        } else {
            return null;
        }
    },

    setLocalProfile: function(data) {
        $window.localStorage.setItem('userProfile', JSON.stringify(data));
    }
};
}];
});
