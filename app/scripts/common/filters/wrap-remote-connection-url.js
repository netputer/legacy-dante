define([
], function(
) {
'use strict';
return ['wdDev', function(wdDev) {

return function(url, type) {
    var wrappedURL = url;
    if (url && url.indexOf('data:image/jpeg;base64') === -1 && wdDev.isRemoteConnection()) {
        url = wdDev.wrapPrefixURL(url);
        wrappedURL = wdDev.wrapRemoteConnectionURL(url, type);
    }
    return wrappedURL;
};

}];
});
