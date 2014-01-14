define([
    'jquery',
    'underscore'
], function(
    jQuery,
    _
) {

// wdDownloadProvider
'use strict';
return function() {

    this.$get = [function() {
        return {
            download: function(url) {
                jQuery('<iframe>').hide().prop('src', url).appendTo('body');
            },
            createTarget: function() {
                var id = _.uniqueId('wddownload_delegate_');
                jQuery('<iframe style="display: none" src="about:blank"></iframe>').attr('id', id).appendTo('body');
                return id;
            }
        };
    }];
};

});
