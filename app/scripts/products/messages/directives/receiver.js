define([
    'underscore'
], function(
    _
) {
'use strict';
return ['wdmContactSearch', '$rootScope',
function(wdmContactSearch,   $rootScope) {
return {

link: function(scope, element) {
    wdmContactSearch.init();
    var itemManager = {
        stringToItem: function(str) {
            var parts = str.split(':');
            return {
                display_name: parts[1] || '',
                number: parts[0]
            };
        },

        itemToString: function(item) {
            return item.number + ':' + item.display_name;
        },

        compareItems: function(item1, item2) {
            return item1 != null && item2 != null && (item1 === item2 || (item1.number === item2.number && item1.display_name === item2.display_name));
        }
    };



    scope.$watch('activeConversation.addresses', function(addresses, old) {
        var items = [];
        var i;
        var len = addresses.length;

        if ($rootScope.SDK_19) {
            var placeholder = element.parent().find('.text-prompt');
            if (len === 1) {
                var marginLeftVal = element.css('padding-left');
                element.hide();
                placeholder.hide();
            } else if (!len){
                element.show();
            }
        }

        for (i = 0; i < len; i += 1) {
            var a = addresses[i];
            var n = scope.activeConversation.contact_names[i] || '';
            items.push({
                display_name: n,
                number: a
            });
        }
        if (addresses === old) {
            element.textext({
                plugins : 'tags prompt autocomplete',
                prompt : scope.$root.DICT.messages.RECEIVER_PLACEHOLDER,
                ext: {
                    itemManager: itemManager
                },
                html : {
                    tag  : '<div class="text-tag"><div class="text-button"><span class="text-label"/><span class="text-remove">&times;</span></div></div>'
                },
                tags: {
                    items: items
                },
                autocomplete: {
                    dropdown: {
                        maxHeight: '200px'
                    },
                    render: function(suggestion) {
                        return '<span>' + suggestion.display_name + '</span>&nbsp;' + suggestion.number;
                    }
                }
                // ajax : {
                //     typeDelay: 0.2,
                //     type: 'POST',
                //     contentType: 'application/json; charset=utf-8',
                //     url : wdDev.wrapURL('/resource/contacts/suggestion?offset=0&length=20'),
                //     dataType : 'json',
                //     xhrFields: {
                //         withCredentials: true
                //     },
                //     processData: false,
                //     dataCallback: function(query) {
                //         var data = [{
                //             field: 'keyword',
                //             keyword: query
                //         }];
                //         return JSON.stringify(data);
                //     }
                // }
            });

            element.on('getSuggestions', function(e, data) {
                var query = data.query;
                element.data('currentQuery', query);
                if (!query) {
                    element.trigger('setSuggestions', { result: [] });
                }
                else {
                    wdmContactSearch.search(query).then(function(results) {
                        if (query !== element.data('currentQuery')) { return; }

                        var data = results.map(function(r) {
                            return {
                                display_name: r.name,
                                number: r.phone
                            };
                        });
                        element.trigger('setSuggestions', { result : data });
                    });
                }
            });

            element.on('setFormData', function() {
                setData(element.textext()[0]);
                scope.$apply();
            });
        }
    });

    scope.$on('wdm:beforeMessageSend', function() {
        var textext = element.textext()[0];
        textext.tags().onBlur();
        element.val('');
        setData(textext);
    });

    function setData(textext) {
        var items = JSON.parse(textext.hiddenInput().val());
        var addresses = [];
        var names = [];
        var ids = [];
        var photos = [];

        _(items).forEach(function(item) {
            addresses.push(item.number);
            names.push(item.display_name);
            ids.push(-1);
            photos.push('');
        });
        scope.activeConversation.extend({
            addresses: addresses,
            contact_names: names,
            contact_ids: ids,
            photo_paths: photos
        });
    }

    _.defer(function() {
        element.focus();
    });
}

};
}];
});
