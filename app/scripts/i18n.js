define([
    'underscore',
    'jquery'
], function(
    _,
    jQuery
) {
'use strict';

var dictionaryCache = {
    root: {},
    'zh-cn': {},
    'zh-tw': {}
};
var configCache = {
    root: {},
    'zh-cn': {}
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
        }, []);
    },
    getDictionary: function() {
        return generateByPath(dictionaryCache, this.languagePath);
    },
    getConfig: function() {
        return generateByPath(configCache, this.languagePath);
    }
});

function generateByPath(cache, path) {
    return path.reverse().reduce(function(result, languageName) {
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
