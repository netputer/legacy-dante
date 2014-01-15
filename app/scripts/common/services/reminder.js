define([], function() {
'use strict';
return ['$q', function($q) {
    var modal = null;
    return {
        registerModal: function(newModal) {
            modal = newModal;
        },
        open: function(header, content, ok, help, clickToHide, disabledButton) {
            if (modal === null) {
                throw new Error('Not Found Remind Modal');
            }
            return $q.when(modal.create({
                header: header,
                content: content,
                ok: ok,
                help: help,
                clickToHide: clickToHide === undefined ? true : false,
                disabledButton: disabledButton === undefined ? false : disabledButton
            }));
        },
        close: function(header, content, ok, cancel) {
            if (modal === null) {
                throw new Error('Not Found Remind Modal');
            }
            return $q.when(modal.destory());
        }
    };
}];
});
