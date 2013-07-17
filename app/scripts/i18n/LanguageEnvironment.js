define([
    'underscore',
    'jquery',
    'i18n/root/dict',
    'i18n/root/config',
    'i18n/zh-cn/dict',
    'i18n/zh-cn/config',
    'i18n/zh-tw/dict',
    'i18n/zh-tw/config',
    'i18n/de/dict',
    'i18n/de/config',
], function(
    _,
    jQuery,
    rootDict,
    rootConfig,
    zhcnDict,
    zhcnConfig,
    zhtwDict,
    zhtwConfig,
    deDict,
    deConfig
) {
'use strict';

var dictionaryCache = {
    root: rootDict,
    'zh-cn': zhcnDict,
    'zh-tw': zhtwDict,
    'de': deDict
};
var configCache = {
    root: rootConfig,
    'zh-cn': zhcnConfig,
    'zh-tw': zhtwConfig,
    'de': deConfig
};

function LanguageEnvironment(language) {
    this.languagePath = this.generateLanguagePath(language);
}

_.extend(LanguageEnvironment.prototype, {
    getLanguageName: function() {
        return this.languagePath[0];
    },
    generateLanguagePath: function(language) {
        return language.toLowerCase().split('-').reduce(function(path, segment, index, segments) {
            path.push(segments.slice(0, index + 1).join('-'));
            return path;
        }, []).reverse();
    },
    getDictionary: function() {
        return generateByPath(dictionaryCache, this.languagePath);
    },
    getConfig: function() {
        return generateByPath(configCache, this.languagePath);
    }
});

function generateByPath(cache, path) {
    return path.reduce(function(result, languageName) {
        if (languageName in cache) {
            deepCopy(result, cache[languageName]);
        }
        return result;
    }, deepCopy({}, cache.root));
}

function deepCopy(target, source) {
    return jQuery.extend.apply(jQuery, [true].concat(Array.prototype.slice.call(arguments)));
}

return {
    prepare: function(language) {
        return new LanguageEnvironment(language);
    }
};

});
