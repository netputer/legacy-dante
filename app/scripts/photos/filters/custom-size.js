define([
], function(
) {
'use strict';
return [function() {

return function(photo, max) {
    var maxLength = Math.max(photo.width, photo.height);
    var MAX = max || 1200;
    var width = photo.width;
    var height = photo.height;

    if (maxLength > MAX) {
        if (photo.width > photo.height) {
            width = MAX;
            height = parseInt(MAX / photo.width * photo.height, 10);
        } else {
            height = MAX;
            width = parseInt(MAX / photo.height * photo.width, 10);
        }

    }
   
    var size = {
        'width': width,
        'height': height
    };
    return size;
};

}];
});
