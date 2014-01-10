define([
], function(
) {
'use strict';
return ['wdDev', function(wdDev) {

return function(url, isUpload) {
    var wrappedURL = url;
    if (url && wdDev.isRemoteConnection()) {
        wrappedURL = isUpload ? wdDev.wrapRemoteConnectionUploadURL(url) : wdDev.wrapRemoteConnectionURL(url);
    }
    return wrappedURL;
};

}];
});
