define([
    'facebook'
], function(
    Facebook
    ) {
    'use strict';

    return ['$q', '$http',
        function($q, $http) {
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
                                    '&message=' + shareInfo.message + '&created_time=' + new Date();
                    $.ajax({
                        url : shareUrl,
                        cache: false,
                        contentType: false,
                        processData: false,
                        data : formData,
                        type : 'POST',
                        success : function(r) {
                            defer.reslove(r);
                        },
                        error : function(r) {
                            defer.reject(r.responseJSON);
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