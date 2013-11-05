define([
    'text!templates/messages/audio.html',
    'jquery',
    'moment'
    ], function(template, $, moment) {
'use strict';
return ['$window', function($window) {
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

            $scope.audio.playing = false;

            if (audioElement.canPlayType($scope.audio.content_type).length) {
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
                        audioElement.src = $scope.audio.content;
                        audioElement.play();
                        $scope.audio.playing = true;
                    } else {
                        audioElement.pause();
                        $scope.audio.playing = false;
                        setInitDuration();
                    }
                }
                
            };
        }
    };
}];
});
