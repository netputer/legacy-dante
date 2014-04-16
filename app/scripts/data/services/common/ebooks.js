define([
    'underscore'
    ], function(
    _
    ) {
    'use strict';

    return ['$http', '$q',
    function($http,   $q) {

        function Ebooks() {
            this.list = [
                {
                    id: 1,
                    videoBase: {
                        cover: {
                            l: 'http://img.wdjimg.com/image/video/fe4f2bd1331903a95db07bab1112edc3_124_174.jpeg',
                            s: 'http://img.wdjimg.com/image/video/fe4f2bd1331903a95db07bab1112edc3_72_102.jpeg'
                        },
                        id: 100,
                        latestEpisodeDate: 0,
                        latestEpisodeNum: 1,
                        title: '她真漂亮',
                        totalEpisodesNum: 1,
                        type: 'TV'
                    },
                    videoEpisodes: [
                        {
                            baseInfo: {
                                accelUrl: 'http://oscar.wandoujia.com/redirect?url=http%3A%2F%2Fdservice.wandoujia.com%2Faccelerator%3Fdownloadurl%3Dhttp%253A%252F%252Fdservice.wdjcdn.com%252F65a9b541%252F77dddb5f%252F017c072f%252F65a9b54177dddb5f017c072f3540ddbc&videoId=100&videoEpisodeId=712',
                                episodeDate: null,
                                episodeId: 712,
                                episodeNum: 1,
                                provider: '搜狐视频',
                                runtime: 5674,
                                sharpness: null,
                                size: 180166733,
                                videoId: 100
                            },
                            userInfo: {
                                creation: 1394695949000,
                                episodeId: 712,
                                id: 3,
                                modification: 1394696464000,
                                newEpisode: false,
                                playStatus: null,
                                provider: '搜狐视频',
                                status: 0,
                                udid: null,
                                uid: 1,
                                version: 0,
                                videoId: 100
                            }
                        },
                        {
                            baseInfo: {
                                accelUrl: 'http://oscar.wandoujia.com/redirect?url=http%3A%2F%2Fdservice.wandoujia.com%2Faccelerator%3Fdownloadurl%3Dhttp%253A%252F%252Fdservice.wdjcdn.com%252F65a9b541%252F77dddb5f%252F017c072f%252F65a9b54177dddb5f017c072f3540ddbc&videoId=100&videoEpisodeId=712',
                                episodeDate: null,
                                episodeId: 712,
                                episodeNum: 1,
                                provider: '搜狐视频',
                                runtime: 5674,
                                sharpness: null,
                                size: 180166733,
                                videoId: 100
                            },
                            userInfo: {
                                creation: 1394695949000,
                                episodeId: 712,
                                id: 3,
                                modification: 1394696464000,
                                newEpisode: false,
                                playStatus: null,
                                provider: '搜狐视频',
                                status: 0,
                                udid: null,
                                uid: 1,
                                version: 0,
                                videoId: 100
                            }
                        },
                        {
                            baseInfo: {
                                accelUrl: 'http://oscar.wandoujia.com/redirect?url=http%3A%2F%2Fdservice.wandoujia.com%2Faccelerator%3Fdownloadurl%3Dhttp%253A%252F%252Fdservice.wdjcdn.com%252F65a9b541%252F77dddb5f%252F017c072f%252F65a9b54177dddb5f017c072f3540ddbc&videoId=100&videoEpisodeId=712',
                                episodeDate: null,
                                episodeId: 712,
                                episodeNum: 1,
                                provider: '搜狐视频',
                                runtime: 5674,
                                sharpness: null,
                                size: 180166733,
                                videoId: 100
                            },
                            userInfo: {
                                creation: 1394695949000,
                                episodeId: 712,
                                id: 3,
                                modification: 1394696464000,
                                newEpisode: false,
                                playStatus: null,
                                provider: '搜狐视频',
                                status: 0,
                                udid: null,
                                uid: 1,
                                version: 0,
                                videoId: 100
                            }
                        },
                        {
                            baseInfo: {
                                accelUrl: 'http://oscar.wandoujia.com/redirect?url=http%3A%2F%2Fdservice.wandoujia.com%2Faccelerator%3Fdownloadurl%3Dhttp%253A%252F%252Fdservice.wdjcdn.com%252F65a9b541%252F77dddb5f%252F017c072f%252F65a9b54177dddb5f017c072f3540ddbc&videoId=100&videoEpisodeId=712',
                                episodeDate: null,
                                episodeId: 712,
                                episodeNum: 1,
                                provider: '搜狐视频',
                                runtime: 5674,
                                sharpness: null,
                                size: 180166733,
                                videoId: 100
                            },
                            userInfo: {
                                creation: 1394695949000,
                                episodeId: 712,
                                id: 3,
                                modification: 1394696464000,
                                newEpisode: false,
                                playStatus: null,
                                provider: '搜狐视频',
                                status: 0,
                                udid: null,
                                uid: 1,
                                version: 0,
                                videoId: 100
                            }
                        },
                        {
                            baseInfo: {
                                accelUrl: 'http://oscar.wandoujia.com/redirect?url=http%3A%2F%2Fdservice.wandoujia.com%2Faccelerator%3Fdownloadurl%3Dhttp%253A%252F%252Fdservice.wdjcdn.com%252F65a9b541%252F77dddb5f%252F017c072f%252F65a9b54177dddb5f017c072f3540ddbc&videoId=100&videoEpisodeId=712',
                                episodeDate: null,
                                episodeId: 712,
                                episodeNum: 1,
                                provider: '搜狐视频',
                                runtime: 5674,
                                sharpness: null,
                                size: 180166733,
                                videoId: 100
                            },
                            userInfo: {
                                creation: 1394695949000,
                                episodeId: 712,
                                id: 3,
                                modification: 1394696464000,
                                newEpisode: false,
                                playStatus: null,
                                provider: '搜狐视频',
                                status: 0,
                                udid: null,
                                uid: 1,
                                version: 0,
                                videoId: 100
                            }
                        },
                        {
                            baseInfo: {
                                accelUrl: 'http://oscar.wandoujia.com/redirect?url=http%3A%2F%2Fdservice.wandoujia.com%2Faccelerator%3Fdownloadurl%3Dhttp%253A%252F%252Fdservice.wdjcdn.com%252F65a9b541%252F77dddb5f%252F017c072f%252F65a9b54177dddb5f017c072f3540ddbc&videoId=100&videoEpisodeId=712',
                                episodeDate: null,
                                episodeId: 712,
                                episodeNum: 1,
                                provider: '搜狐视频',
                                runtime: 5674,
                                sharpness: null,
                                size: 180166733,
                                videoId: 100
                            },
                            userInfo: {
                                creation: 1394695949000,
                                episodeId: 712,
                                id: 3,
                                modification: 1394696464000,
                                newEpisode: false,
                                playStatus: null,
                                provider: '搜狐视频',
                                status: 0,
                                udid: null,
                                uid: 1,
                                version: 0,
                                videoId: 100
                            }
                        },
                        {
                            baseInfo: {
                                accelUrl: 'http://oscar.wandoujia.com/redirect?url=http%3A%2F%2Fdservice.wandoujia.com%2Faccelerator%3Fdownloadurl%3Dhttp%253A%252F%252Fdservice.wdjcdn.com%252F65a9b541%252F77dddb5f%252F017c072f%252F65a9b54177dddb5f017c072f3540ddbc&videoId=100&videoEpisodeId=712',
                                episodeDate: null,
                                episodeId: 712,
                                episodeNum: 1,
                                provider: '搜狐视频',
                                runtime: 5674,
                                sharpness: null,
                                size: 180166733,
                                videoId: 100
                            },
                            userInfo: {
                                creation: 1394695949000,
                                episodeId: 712,
                                id: 3,
                                modification: 1394696464000,
                                newEpisode: false,
                                playStatus: null,
                                provider: '搜狐视频',
                                status: 0,
                                udid: null,
                                uid: 1,
                                version: 0,
                                videoId: 100
                            }
                        },
                        {
                            baseInfo: {
                                accelUrl: 'http://oscar.wandoujia.com/redirect?url=http%3A%2F%2Fdservice.wandoujia.com%2Faccelerator%3Fdownloadurl%3Dhttp%253A%252F%252Fdservice.wdjcdn.com%252F65a9b541%252F77dddb5f%252F017c072f%252F65a9b54177dddb5f017c072f3540ddbc&videoId=100&videoEpisodeId=712',
                                episodeDate: null,
                                episodeId: 712,
                                episodeNum: 1,
                                provider: '搜狐视频',
                                runtime: 5674,
                                sharpness: null,
                                size: 180166733,
                                videoId: 100
                            },
                            userInfo: {
                                creation: 1394695949000,
                                episodeId: 712,
                                id: 3,
                                modification: 1394696464000,
                                newEpisode: false,
                                playStatus: null,
                                provider: '搜狐视频',
                                status: 0,
                                udid: null,
                                uid: 1,
                                version: 0,
                                videoId: 100
                            }
                        }
                    ]
                },
                {
                    id: 1,
                    videoBase: {
                        cover: {
                            l: 'http://img.wdjimg.com/image/video/fe4f2bd1331903a95db07bab1112edc3_124_174.jpeg',
                            s: 'http://img.wdjimg.com/image/video/fe4f2bd1331903a95db07bab1112edc3_72_102.jpeg'
                        },
                        id: 100,
                        latestEpisodeDate: 0,
                        latestEpisodeNum: 1,
                        title: '她真漂亮',
                        totalEpisodesNum: 1,
                        type: 'MOVIE'
                    },
                    videoEpisodes: [
                        {
                            baseInfo: {
                                accelUrl: 'http://oscar.wandoujia.com/redirect?url=http%3A%2F%2Fdservice.wandoujia.com%2Faccelerator%3Fdownloadurl%3Dhttp%253A%252F%252Fdservice.wdjcdn.com%252F65a9b541%252F77dddb5f%252F017c072f%252F65a9b54177dddb5f017c072f3540ddbc&videoId=100&videoEpisodeId=712',
                                episodeDate: null,
                                episodeId: 712,
                                episodeNum: 1,
                                provider: '搜狐视频',
                                runtime: 5674,
                                sharpness: null,
                                size: 180166733,
                                videoId: 100
                            },
                            userInfo: {
                                creation: 1394695949000,
                                episodeId: 712,
                                id: 3,
                                modification: 1394696464000,
                                newEpisode: false,
                                playStatus: null,
                                provider: '搜狐视频',
                                status: 0,
                                udid: null,
                                uid: 1,
                                version: 0,
                                videoId: 100
                            }
                        }
                    ]
                }
            ];
        }

        _.extend(Ebooks.prototype, {
            getEbookList: function() {
                if (this.list.length) {
                    var defer = $q.defer();

                    defer.resolve(this.list);
                    return defer.promise;
                } else {
                    return $http({
                        method: 'get',
                        url: 'http://192.168.109.145:8080/sync-webapp/resource/videos?uid=1'
                    }).then(function(data) {
                        this.list = data;
                    }.bind(this));

                }
            }
        });

        return Ebooks;
    }];
});