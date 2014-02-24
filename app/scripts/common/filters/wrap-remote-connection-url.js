define([
], function(
) {
'use strict';
return [
'wdDev', '$rootScope', 
function(wdDev, $rootScope) {

return function(url, type) {
    var wrappedURL = url;

    if ( !$rootScope.READ_ONLY_FLAG && wrappedURL && wrappedURL.indexOf('data:image') === -1 ) {
        wrappedURL = wdDev.wrapPrefixURL(wrappedURL);
        var host = wdDev.getIP().length ? wdDev.getIP() : 'null';
        var urlHostArray = wrappedURL.match(/\/\/([^:\/ ]+).?.*/);
        if (urlHostArray && urlHostArray.length > 1 && host !== urlHostArray[1]) {
            var urlHost = urlHostArray[1];
            wrappedURL = 'http://' + host + wrappedURL.split(urlHost)[1];
        }
        if (wdDev.isRemoteConnection()) {
            wrappedURL = wdDev.wrapRemoteConnectionURL(wrappedURL, type);
        }
    }
    
    return wrappedURL;
};

}];
});
