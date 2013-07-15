define([
], function(
    ) {
    'use strict';

    return ['$q', '$http', '$rootScope',
        function($q, $http, $rootScope) {
            var constNum = 3;
            var retryGetPhotoBlobTimes = constNum;

            var share = {
                recoverRetryGetPhotoBlobTimes : function(number) {
                    retryGetPhotoBlobTimes = number == undefined ? constNum : number;
                },

                uploadPhoto : function(data, shareInfo) {
                    var defer = $q.defer();

                    var formData = new FormData();
                    formData.append('name', data);

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
                        responseType: 'blob'
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