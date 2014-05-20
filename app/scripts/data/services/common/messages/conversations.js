define([
    'underscore'
], function(
    _
) {
'use strict';
return ['wdmExtendedConversationsCollection', 'wdmConversationsCollection',
        '$q', '$rootScope', 'wdSocket', 'wdEventEmitter', 
        'wdmSearchConversation', 'wdmMessage', 'wdDatabase', 'GA', 'wdDesktopNotification', 
        'wdWindowFocus', '$route', '$location', '$window', 'wdDev', 'wdmBasicConversation', 'wdmSyncMessagesCollection',
function(wdmExtendedConversationsCollection,   wdmConversationsCollection, 
         $q,   $rootScope,   wdSocket,   wdEventEmitter,
         wdmSearchConversation,   wdmMessage,   wdDatabase,   GA,   wdDesktopNotification,   
         wdWindowFocus,   $route,   $location,   $window,   wdDev,  wdmBasicConversation,    wdmSyncMessagesCollection) {

var contactsCache = null;
var self;

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

        var retryCounter = 3;
        function fetch(offset, blackList) {
            blackList = blackList || {};
            self.http.get('/resource/contacts',{
                params: {
                    offset: offset,
                    length: 150,
                    simple: true
                }
            }).then(function(response) {
                var data = response.data;
                offset += data.length;
                retryCounter = 3;

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
            }, function() {
                retryCounter -= 1;
                if (retryCounter) {
                    fetch(offset, blackList);
                }
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

function notify(message) {
    if (!wdWindowFocus.getStatus() || $route.current.locals.nav !== 'messages') {
        wdDesktopNotification.showNewMessage($rootScope.DICT.messages.NEW_MESSAGE_TIP.replace('$$$$', message.contact_names[0] || message.addresses[0]), message.body, function() {
            $location.path('/messages').search('show', message.cid);
            $window.focus();
        });
    }
}

function Message(dataChannel) {
    self = this;

    _.extend(this, dataChannel);
    _.extend(wdmExtendedConversationsCollection.ExtendedConversationsCollection.prototype, dataChannel);
    _.extend(wdmBasicConversation.BasicConversation.prototype, dataChannel);
    _.extend(wdmMessage.Message.prototype, dataChannel);
    _.extend(wdmSyncMessagesCollection.SyncMessagesCollection.prototype, dataChannel);

    var conversations = wdmExtendedConversationsCollection.createExtendedConversationsCollection();
    // Mixin event emitter.
    wdEventEmitter(conversations);

    _.extend(Message.prototype, {
        conversations: conversations,
        initialize: function() {
            $rootScope.$on('signin', function() {
                if (!$rootScope.READ_ONLY_FLAG && !wdDev.isWapRemoteConnection()) {
                    buildContactsCache();
                }
            });

            $rootScope.$on('signout', function() {
                conversations.clear();
                contactsCache = null;
            });

            wdSocket.on('messages_add.wdm messages_update.wdm', function(e, msg) {
                var cid = msg.data.threadId;
                var mid = msg.data.messageId;

                $q.when(conversations.getById(cid) || conversations.fetch(cid)).then(function(c) {
                    c.messages.fetch(mid).then(function(message) {
                        if (e.type === 'messages_add') {
                            notify(message);
                        }
                        conversations.sort();
                        conversations.trigger('update', [c]);
                    });
                });
            }).on('refresh', function(){
                conversations.clear();
            });
        },
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
            return self.http.post(
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
            return self.http.post(
                '/resource/messages/search',
                [{
                    field: 'keyword',
                    keyword: keyword
                }],
                {
                    params: {
                        offset: 0,
                        length: 20000
                    },
                    timeout: 60 * 1000
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
    });
}


return Message;

}];
});
