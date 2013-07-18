define([
], function(
    ) {
    'use strict';

    return ['$q', '$http', '$rootScope',
        function($q, $http, $rootScope) {
            var constNum = 3;
            var retryGetPhotoBlobTimes = constNum;
            var isConnectedFacebook = false;

            var share = {
                getIsConnectedFacebook : function() {
                    return isConnectedFacebook;
                },

                getFacebookLoginStatus : function() {
                    var defer = $q.defer();

                    window.facebookInitDefer.done(function(Facebook) {
                        Facebook.getLoginStatus(function(response) {
                            if (response.status === 'connected') {
                                isConnectedFacebook = true;

                                defer.resolve(response.authResponse);
                            } else {
                                isConnectedFacebook = false;

                                defer.reject(response);
                            }
                        });
                    });

                    return defer.promise;
                },

                connectFacebook : function() {
                    var defer = $q.defer();

                    window.facebookInitDefer.done(function(Facebook) {
                        Facebook.login(function(response) {
                            if (response.status === 'connected') {
                                $rootScope.$apply(function() {
                                    isConnectedFacebook = true;

                                    defer.resolve(response.authResponse);
                                });
                            } else {
                                $rootScope.$apply(function() {
                                    isConnectedFacebook = false;

                                    defer.reject(response);
                                });
                            }
                        }, {scope : 'user_photos,publish_stream'});
                    });

                    return defer.promise;
                },

                disconnectFacebook : function() {
                    var defer = $q.defer();

                    window.facebookInitDefer.done(function(Facebook) {
                        Facebook.logout(function(response) {
                            if (response.status !== 'connected') {
                                $rootScope.$apply(function() {
                                    defer.resolve(response);

                                    isConnectedFacebook = false;
                                });
                                
                            } else {
                                $rootScope.$apply(function() {
                                    defer.reject(response);

                                    isConnectedFacebook = true;
                                });
                            }
                        });
                    });

                    return defer.promise;
                },

                recoverRetryGetPhotoBlobTimes : function(number) {
                    retryGetPhotoBlobTimes = number == undefined ? constNum : number;
                },

                uploadPhoto : function(data, shareInfo) {
                    var defer = $q.defer();

                    var blob = new Blob([data]);
                    var formData = new FormData();
                    formData.append('name', blob);

                    var shareUrl = 'https://graph.facebook.com/photos?access_token=' + shareInfo.accessToken + 
                                    '&message=' + encodeURIComponent(shareInfo.message) + '&created_time=' + new Date();
                    $.ajax({
                        url : shareUrl,
                        cache: false,
                        contentType: false,
                        processData: false,
                        data : formData,
                        type : 'POST',
                        success : function(r) {
                            $rootScope.$apply(function() {
                                defer.resolve(r);
                            });
                        },
                        error : function(r) {
                            $rootScope.$apply(function() {
                                defer.reject(r.responseJSON, data);
                            });
                        }
                    });

                    return defer.promise;
                },

                getPhotoBlob : function(photo) {

                    return $http.get(photo.path, {
                        responseType: 'arraybuffer'
                    }).then(function(response) {
                        return response.data;
                    }, function() {
                        if (retryGetPhotoBlobTimes) {
                            retryGetPhotoBlobTimes -= 1;

                            return share.getPhotoBlob(photo);
                        } else {
                            return $q.reject(photo);
                        }

                    });
                }
            }

            return share;
        }
    ];
});