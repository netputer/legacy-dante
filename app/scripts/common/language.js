define([
    'angular',
    'i18n/LanguageEnvironment'
], function(
    angular,
    LanguageEnvironment
) {
'use strict';
angular.module('wdLanguage', [])
    .factory('wdLanguageEnvironment', ['$window', '$rootScope', '$document', function($window, $rootScope, $document) {
        var currentLanguageEnvironment = null;
        var previousLanguageClassNames = '';

        return {
            apply: function(language) {
                if ($rootScope.READ_ONLY_FLAG) {
                    language = 'zh-cn';
                }
                else {
                    language = (language || $window.localStorage.getItem('preferredLanguage') || $window.navigator.language || $window.navigator.browserLanguage).toLowerCase();
                    if (language === 'zh-cn') {
                        language = 'en';
                    }
                }

                currentLanguageEnvironment = LanguageEnvironment.prepare(language);
                $window.localStorage.setItem('preferredLanguage', language);
                $rootScope.DICT = currentLanguageEnvironment.getDictionary();
                $rootScope.CONFIG = currentLanguageEnvironment.getConfig();

                var currentLanguageClassNames = currentLanguageEnvironment.languagePath.join(' ');
                $document.find('html').removeClass(previousLanguageClassNames).addClass(currentLanguageClassNames);
                previousLanguageClassNames = currentLanguageClassNames;
            },
            getCurrentLanguageEnvironment: function() {
                return currentLanguageEnvironment;
            },
            getCurrentLanguageName: function() {
                return currentLanguageEnvironment.getLanguageName();
            },
            currentLanguageBelongsTo: function(language) {
                return currentLanguageEnvironment.languagePath.indexOf(language) >= 0;
            }
        };
    }]);
});
