define([
], function(
) {
'use strict';
return [function() {

return function(size) {
    return (size / 1024 / 1024).toFixed(2) * 1;
};

}];
});
