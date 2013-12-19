define([
    'emoji'
], function(
    emoji
) {
'use strict';
return [function() {
    return function(input) {
        input = emoji.softbankToUnified(input);
        input = emoji.googleToUnified(input);
        input = emoji.docomoToUnified(input);
        input = emoji.kddiToUnified(input);
        
        return emoji.unifiedToHTML(input);
    };
}];
});
