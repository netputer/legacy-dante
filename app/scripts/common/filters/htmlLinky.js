define([
    'underscore'
], function(
    _
) {
'use strict';
return [function() {

return function(input, target) {
    var LINKY_URL_REGEXP =
        /((ftp|https?):\/\/|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>]/,
        MAILTO_REGEXP = /^mailto:/;

    if (!input) {
        return input;
    }
    var match;
    var raw = input;
    var html = [];
    var url;
    var i;
    while ((match = raw.match(LINKY_URL_REGEXP))) {
        // We can not end in these as they are sometimes found at the end of the sentence
        url = match[0];
        // if we did not match ftp/http/mailto then assume mailto
        if (match[2] === match[3]) {
        url = 'mailto:' + url;
        }
        i = match.index;
        addText(raw.substr(0, i));
        addLink(url, match[0].replace(MAILTO_REGEXP, ''));
        raw = raw.substring(i + match[0].length);
    }
    addText(raw);
    return html.join('');

    function addText(text) {
        if (!text) {
            return;
        }
        html.push(text);
    }

    function addLink(url, text) {
        html.push('<a ');
        if (target) {
            html.push('target="');
            html.push(target);
            html.push('" ');
        }
        
        html.push('href="');
        html.push(url);
        html.push('">');
        addText(text);
        html.push('</a>');
    }
};

}];
});
