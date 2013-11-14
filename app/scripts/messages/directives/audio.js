define([
    'text!templates/messages/audio.html',
    'jquery',
    'moment',
    'underscore'
    ], function(template, $, moment, _) {
'use strict';
return ['$window', function($window) {
    var audioList = [];

    return {
        template: template,
        replace: true,
        scope: {
            audio: '='
        },
        link: function($scope, $element, $attributes) {
            var audioElement = $element.find('audio')[0];

            var audio = {
                formatDuration: function(duration) {
                    return moment({s: duration}).format('mm:ss');
                },

                setInitDuration: function() {
                    $scope.audio.formatedDuration = audio.formatDuration(audioElement.duration);
                },

                downloadAudio: function() {
                    $window.location = $scope.audio.content;
                },

                pause: function() {
                    audioElement.pause();
                    $scope.audio.playing = false;
                    audio.setInitDuration();
                },

                play: function() {
                    audioElement.src = $scope.audio.content;
                    audioElement.play();
                    $scope.audio.playing = true;
                }
            };
            
            

            $scope.audio.playing = false;

            if (audioElement.canPlayType($scope.audio.content_type).length) {
                audioList.push(audio);

                $scope.audio.formatedDuration = audioElement.duration ? audio.formatDuration(audioElement.duration) : '';
            } else {
                $scope.audio.formatedDuration = audio.formatDuration($scope.audio.duration / 1000);
            }

            audioElement.addEventListener('loadedmetadata', function() {
                $scope.$apply(function() {
                    audio.setInitDuration();
                });
            }, false);

            audioElement.addEventListener('timeupdate', function(evt) {
                if (audioElement.duration && !audioElement.paused) {
                    $scope.$apply(function() {
                        var lastTime = audioElement.duration - audioElement.currentTime;
                        $scope.audio.formatedDuration = audio.formatDuration(lastTime);
                    });
                }
                
            }, false);

            audioElement.addEventListener('ended', function() {
                $scope.$apply(function() {
                    $scope.audio.playing = false;
                    audio.setInitDuration();
                });
            }, false);

            $scope.audio.controller = function() {
                if (!audioElement.canPlayType($scope.audio.content_type).length) {
                    audio.downloadAudio();
                } else {
                    if (audioElement.paused) {
                        _.each(audioList, function(item) {
                            item.pause();
                        });
                        audio.play();
                    } else {
                        audio.pause();
                    }
                }
                
            };
        }
    };
}];
});
