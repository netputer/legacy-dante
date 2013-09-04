define([
    'underscore'
], function(
    _
) {
'use strict';
return ['wdmExtendedConversationsCollection', 'wdmConversationsCollection',
        '$http', '$q', '$rootScope', 'wdSocket', 'wdEventEmitter',
        'wdmSearchConversation', 'wdmMessage', 'wdDatabase', 'GA',
function(wdmExtendedConversationsCollection,   wdmConversationsCollection,
         $http,   $q,   $rootScope,   wdSocket,   wdEventEmitter,
         wdmSearchConversation,   wdmMessage,   wdDatabase,   GA) {

var conversations = wdmExtendedConversationsCollection.createExtendedConversationsCollection();
var contactsCache = null;

function buildContactsCache() {
    contactsCache = null;
    wdDatabase.current().promise.then(function(db) {

        function readCache() {
            var defer = $q.defer();
            var cache = [];
            var transaction = db.transaction(['contactsIndex'], 'readonly');
            var req = transaction.objectStore('contactsIndex').openCursor();

            req.onsuccess = function(e) {
                var cursor = e.target.result;
                if (cursor) {
                    var value = cursor.value;
                    value.phone = value.phone.map(function(number) {
                        return {
                            number: number
                        };
                    });
                    value.name = {
                        display_name: value.display_name
                    };
                    if ('display_name' in value) {
                        delete value.display_name;
                    }
                    cache.push(cursor.value);
                    cursor.continue();
                }
                else {
                    $rootScope.$apply(function() {
                        if (cache.length) {
                            contactsCache = cache;
                            defer.resolve(cache);
                        }
                        else {
                            defer.reject('empty');
                        }
                    });
                }
            };

            transaction.onerror = transaction.onabort = function(e) {
                defer.reject(e.type);
            };

            return defer.promise;
        }

        function fetch(offset, blackList) {
            blackList = blackList || {};
            $http.get('/resource/contacts', {
                params: {
                    offset: offset,
                    length: 150,
                    simple: true
                }
            }).then(function(response) {
                var data = response.data;
                offset += data.length;

                var transaction = db.transaction(['contactsIndex'], 'readwrite');
                var store = transaction.objectStore('contactsIndex');

                data.forEach(function(d) {
                    if (d.id in blackList) {
                        delete blackList[d.id];
                    }
                    store.put(d);
                });

                transaction.onerror = transaction.oncomplete = transaction.onabort = function(e) {
                    if (response.headers('WD-Need-More') !== 'false') {
                        $rootScope.$apply(function() {
                            fetch(offset, blackList);
                        });
                    }
                    else {
                        var transaction = db.transaction(['contactsIndex', 'flags'], 'readwrite');

                        transaction.objectStore('flags').put(Date.now() + 30 * 24 * 3600 * 1000, 'contactsIndexInvalidationTime');
                        var store = transaction.objectStore('contactsIndex');
                        for (var id in blackList) {
                            store.delete(id);
                        }

                        transaction.onerror = transaction.oncomplete = transaction.onabort = function() {
                            readCache();
                        };
                    }
                };

            });
        }

        function syncTotally(blackList) {
            fetch(0, blackList);
        }

        var req = db.transaction(['flags'], 'readonly')
                .objectStore('flags')
                .get('contactsIndexInvalidationTime');
        req.onsuccess = function(e) {
            $rootScope.$apply(function() {
                var cacheFlushDate = e.target.result;
                if (cacheFlushDate && cacheFlushDate > Date.now()) {
                    readCache().then(function(cache) {
                        var blackList = cache.reduce(function(list, value) {
                            list[value.id] = true;
                            return list;
                        }, {});
                        syncTotally(blackList);
                    });
                }
                else {
                    syncTotally();
                }
            });
        };
        req.onerror = function(e) {
            $rootScope.$apply(function() {
                syncTotally();
            });
        };
    }, function(reason) {
        GA('perf:indexeddb:open_' + reason);
    });
}

buildContactsCache();

// Mixin event emitter.
wdEventEmitter(conversations);

$rootScope.$on('signin', function() {
    buildContactsCache();
});

$rootScope.$on('signout', function() {
    conversations.clear();
    contactsCache = null;
});

wdSocket.on('messages_add.wdm messages_update.wdm', function(e, msg) {
    var cid = msg.data.threadId;
    var mid = msg.data.messageId;
    var c = conversations.getById(cid);
    if (c) {
        c.messages.fetch(mid).then(function() {
            conversations.trigger('update', [c]);
        });
    }
    else {
        conversations.fetch(cid);
    }
}).on('refresh', function(){
    conversations.clear();
});

return {
    conversations: conversations,
    searchConversationsFromCache: function(keyword) {
        var regexp = new RegExp(keyword, 'i');
        return conversations.collection.filter(function(c) {
            return c.addresses.concat(c.contact_names).some(function(field) {
                return regexp.test(field);
            });
        }).map(function(c) {
            return c.id;
        });
    },
    searchConversationsFromServer: function(keyword) {
        return $http.post(
            '/resource/conversations/search',
            [{
                field: 'keyword',
                keyword: keyword
            }],
            {
                params: {
                    offset: 0,
                    length: 30
                }
            }
        ).then(function done(response) {
            return conversations.add(response.data.map(conversations.create)).map(function(c) {
                return c.id;
            });
        }, function fail() {
            return [];
        });
    },
    searchMessagesFromServer: function(keyword) {
        return $http.post(
            '/resource/messages/search',
            [{
                field: 'keyword',
                keyword: keyword
            }],
            {
                params: {
                    offset: 0,
                    length: 20000
                }
            }
        ).then(function done(response) {
            var messages = response.data.map(wdmMessage.createMessage);
            var cvs = _.chain(messages).groupBy(function(m) {
                return m.cid;
            }).values().map(function(results) {
                return wdmSearchConversation.createSearchConversation(results);
            }).value();
            // conversations.add(cvs);
            // return cvs.map(function(c) { return c.id; });
            return cvs;
        }, function fail() {
            return [];
        });
    },
    getContactsCache: function() {
        return contactsCache;
    }
};

}];
});
