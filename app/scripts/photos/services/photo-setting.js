define([], function() {
'use strict';
return ['$window', function($window) {
    return {
        photoSnapIntroducesEnabled: function(value) {
            if (arguments.length > 0) {
                $window.localStorage.setItem('photoSnapIntroHide', value);
            } else {
                return $window.localStorage.getItem('photoSnapIntroHide') !== 'true';
            }
        },

        // 介绍安装 photo extension 
        photoExtensionIntroducesEnabled: function(value) {
            if (arguments.length > 0) {
                $window.localStorage.setItem('photoExtensionIntroHide', value);
            } else {
                return $window.localStorage.getItem('photoExtensionIntroHide') !== 'true';
            }
        },

        chromePhotoExtensionTipsEnabled: function(value) {
            if (arguments.length > 0) {
                $window.localStorage.setItem('photosExtensionInstalled', value);
            } else {
                return $window.localStorage.getItem('photosExtensionInstalled') !== 'true';
            }
        }

    };
}];
});
