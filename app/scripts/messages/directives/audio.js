define([
    'text!templates/messages/audio.html',
    'jquery',
    'moment',
    'underscore'
    ], function(template, $, moment, _) {
'use strict';
return ['$window', function($window) {
    var pauseFuncArray = [];
    var pauseAllAudios = function() {
        _.each(pauseFuncArray, function(item) {
            item();
        });
    };

    return {
        template: template,
        replace: true,
        scope: {
            audio: '='
        },
        link: function($scope, $element, $attributes) {
            var audioElement = $element.find('audio')[0];
            
            var formatDuration = function(duration) {
                return moment({s: duration}).format('mm:ss');
            };

            var setInitDuration = function() {
                $scope.audio.formatedDuration = formatDuration(audioElement.duration);
            };

            var downloadAudio = function() {
                $window.location = $scope.audio.content;
            };

            var pause = function() {
                audioElement.pause();
                $scope.audio.playing = false;
                setInitDuration();
            };

            $scope.audio.playing = false;

            if (audioElement.canPlayType($scope.audio.content_type).length) {
                pauseFuncArray.push(pause);

                $scope.audio.formatedDuration = audioElement.duration ? formatDuration(audioElement.duration) : '';
            } else {
                $scope.audio.formatedDuration = formatDuration($scope.audio.duration / 1000);
            }

            audioElement.addEventListener('loadedmetadata', function() {
                $scope.$apply(function() {
                    setInitDuration();
                });
            }, false);

            audioElement.addEventListener('timeupdate', function(evt) {
                if (audioElement.duration && !audioElement.paused) {
                    $scope.$apply(function() {
                        var lastTime = audioElement.duration - audioElement.currentTime;
                        $scope.audio.formatedDuration = formatDuration(lastTime);
                    });
                }
                
            }, false);

            audioElement.addEventListener('ended', function() {
                $scope.$apply(function() {
                    $scope.audio.playing = false;
                    setInitDuration();
                });
            }, false);

            $scope.audio.controller = function() {
                if (!audioElement.canPlayType($scope.audio.content_type).length) {
                    downloadAudio();
                } else {
                    if (audioElement.paused) {
                        pauseAllAudios();
                        audioElement.src = $scope.audio.content;
                        audioElement.play();
                        $scope.audio.playing = true;
                    } else {
                        pause();
                    }
                }
                
            };
        }
    };
}];
});
