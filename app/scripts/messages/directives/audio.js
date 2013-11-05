define([
    'text!templates/messages/audio.html',
    'jquery',
    'moment'
    ], function(template, $, moment) {
'use strict';
return [function() {
    return {
        template: template,
        replace: true,
        link: function($scope, $element, $attributes) {
            var audioElement = $element.find('audio')[0];

            $scope.audio = $scope.$parent.c;
            $scope.audio.playing = false;

            if (audioElement.canPlayType($scope.audio.content_type).length) {
                $scope.audio.formatedDuration = audioElement.duration ? setInitDuration() : '';
            } else {
                $scope.audio.formatedDuration = moment({s: $scope.audio.duration / 1000}).format('mm:ss');
            }

            var setInitDuration = function() {
                $scope.audio.formatedDuration = moment({s: audioElement.duration}).format('mm:ss');
            };

            var downloadAudio = function() {
                window.location = $scope.audio.content;
            };

            audioElement.addEventListener('loadedmetadata', function() {
                $scope.$apply(function() {
                    setInitDuration();
                });
            }, false);

            audioElement.addEventListener('timeupdate', function(evt) {
                if (audioElement.duration && !audioElement.paused) {
                    $scope.$apply(function() {
                        var lastTime = audioElement.duration - audioElement.currentTime;
                        $scope.audio.formatedDuration = moment({s: lastTime}).format('mm:ss');
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
