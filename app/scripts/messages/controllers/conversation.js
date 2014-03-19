define([
    'underscore'
], function(
    _
) {
'use strict';
return ['$scope', '$resource', '$q', '$http', 'wdpMessagePusher', '$timeout', 'wdAlert',
        'GA', '$route', 'wdDataBasic', '$location', 'wdKey', 'wdDesktopNotification', '$window', '$rootScope', 'wdDev',
function($scope,   $resource,   $q,   $http,   wdpMessagePusher,   $timeout,   wdAlert,
         GA,   $route,   wdDataBasic,   $location,   wdKey,   wdDesktopNotification,   $window,   $rootScope,   wdDev) {
GA('vertical:messages');

var wdmConversations = wdDataBasic.getMessagesService();

//wdm alert
var closeWdmAlert = $window.localStorage.getItem('closeWdmAlert');
if ($rootScope.SDK_19 && !closeWdmAlert && !wdDev.isWapRemoteConnection()) {
    $scope.showWdmAlert = true;
} 
$scope.hideWdmAlert = function() {
    $scope.closingAlert = true;
    $window.localStorage.setItem('closeWdmAlert', true);
};

$scope.serverMatchRequirement = $route.current.locals.versionSupport;
$scope.conversationsCache = wdmConversations.conversations;
$scope.conversations = $scope.conversationsCache;
$scope.activeConversation = null;
$scope.cvsChanging = false;
$scope.cvsLoaded = true;
$scope.cvsListFirstLoading = true;

$scope.searchQuery = '';
$scope.resultsList = [];
$scope.searchLoading = false;
$scope.contentResultsList = [];
$scope.contentSearchDone = false;

$scope.cvs = function() {
    var result;
    if ($scope.isSearching()) {
        result = $scope.resultsList.reduce(function(mem, id) {
            var c = $scope.conversationsCache.getById(id);
            if (c) {
                mem.push(c);
            }
            return mem;
        }, []).concat($scope.contentResultsList);
    }
    else {
        result = $scope.conversationsCache.collection;
    }
    if (!result.length) {
        $scope.activeConversation = null;
    }
    result.forEach(function(item, index){
        item.avatarClass = getAvatarClass(index);
    });
    return result;
};

$scope.selectedCount = function() {
    return $scope.cvs().filter(function(c) { return c.selected; }).length;
};

$scope.deselectAll = function() {
    $scope.cvs().forEach(function(c) { c.selected = false; });
};

$scope.isSearching = function() {
    return !!$scope.searchQuery;
};

$scope.clearSearch = function() {
    $scope.searchQuery = '';
};

var searchConversationsFromServer = _.debounce(function(keyword) {
    $scope.$apply(function() {
        GA('messages:search:input');
        wdmConversations.searchConversationsFromServer(keyword).then(function done(list) {
            if ($scope.searchQuery !== keyword) { return; }

            $scope.resultsList = _.uniq($scope.resultsList.concat(list));
            $scope.searchLoading = false;

            var cvs = $scope.cvs();
            if (cvs.length) {
                $scope.showConversation(cvs[0]);
            }
        });
    });
}, 500);

$scope.$watch('searchQuery', function(keyword, oldValue) {
    if (keyword === oldValue) {
        return;
    }
    if (keyword) {
        $scope.searchLoading = true;
        $scope.resultsList = wdmConversations.searchConversationsFromCache(keyword);
        $scope.contentResultsList = [];
        $scope.contentSearchDone = false;
        searchConversationsFromServer(keyword);
    }
    else {
        // kill search results
        $scope.resultsList = [];
        $scope.searchLoading = false;
    }

    var cvs = $scope.cvs();
    if (cvs.length) {
        $scope.showConversation(cvs[0]);
    }
});

$scope.searchContent = function() {
    GA('messages:search:content');
    var keyword = $scope.searchQuery;
    return wdmConversations.searchMessagesFromServer(keyword).then(function done(list) {
        if ($scope.searchQuery !== keyword) { return; }

        $scope.contentResultsList = list;
        $scope.contentSearchDone = true;

        var cvs = $scope.cvs();
        if (cvs.length) {
            $scope.showConversation(cvs[0]);
        }
    });
};

$scope.prevResults = function(c) {
    $scope.cvsChanging = true;
    c.previous().then(function done() {
        $scope.cvsChanging = false;
    }, function fail() {
        $scope.cvsChanging = false;
    }).then(function() {
        _.defer(function() {
            $scope.$broadcast('wdm:autoscroll:flip');
        });
    });
};
$scope.nextResults = function(c) {
    $scope.cvsChanging = true;
    c.next().then(function done() {
        $scope.cvsChanging = false;
    }, function fail() {
        $scope.cvsChanging = false;
    }).then(function() {
        _.defer(function() {
            $scope.$broadcast('wdm:autoscroll:flip');
        });
    });
};

// A very temp way
// $scope.jumpToContacts = function(c) {
//     if (c.multiple) { return; }
//     var contactId;
//     if (c.messages.length) {
//         contactId = c.messages.collection[0].person;
//     }
//     else {
//         contactId = c.messages.fetch().then(function(messages) {
//             return messages[0].person;
//         });
//     }
//     $q.when(contactId).then(function(id) {
//         if (!id) { return; }
//         $location.path('/contacts').search({
//             contact_id: id
//         });
//     });
// };

$scope.conversations.on('update.wdm', function(e, c) {
    if (c === $scope.activeConversation) {
        scrollIntoView();
    }
});

$scope.createConversation = function() {
    var c = _($scope.conversations.collection).find(function(c) {
        return c.isNew;
    });
    if (!c) {
        c = $scope.conversations.create();
        $scope.conversations.add(c);
    }
    $scope.clearSearch();
    $scope.showConversation(c);
    return c;
};

$scope.showConversation = function(c, withoutKeepVisible) {
    if (!c) { return; }
    var promise = activeConversation(c);
    if (withoutKeepVisible !== false) {
        $scope.$broadcast('wdm:conversations:intoView');
    }
    promise.then(function() {
        _.defer(function() {
            $scope.$broadcast('wdm:autoscroll:flip');
        });
    });
    return promise;
};

$scope.sendMessage = function(c) {
    if (!c.draft) { return; }
    // Result conversation needs copy draft into copied conversation in cache
    var draft = c.draft;
    c = $scope.conversationsCache.getById(c.id);
    c.draft = draft;

    // Broadcast beforeMessageSend to assure all necessary data that should be prepared and merge into scope
    $scope.$broadcast('wdm:beforeMessageSend', c);

    if (!c.addresses.length) { return; }

    GA('messages:send');

    $scope.conversations.sendMessages(c).then(function(cc) {
        if (cc !== $scope.activeConversation) {
            $scope.showConversation(cc);
        }
    }, function() {
        GA('messages:send_failed');
    });

    $scope.conversations.sort();

    scrollIntoView();

    // Always jump to default view when send messages.
    $scope.clearSearch();
};

$scope.resendMessage = function(c, m) {
    $scope.conversations.sendMessages(c, m).then(function(cc) {
        if (cc !== $scope.activeConversation) {
            $scope.showConversation(cc);
        }
    });
};

$scope.remove = function(c) {
    wdAlert.confirm(
        $scope.$root.DICT.messages.CONFIRM_DELETE_TITLE,
        $scope.$root.DICT.messages.CONFIRM_DELETE_CONTENT,
        $scope.$root.DICT.messages.CONFIRM_DELETE_OK,
        $scope.$root.DICT.messages.CONFIRM_DELETE_CANCEL
    ).then(function() {
        if (c.isSearchResult) {
            var index = $scope.contentResultsList.indexOf(c);
            if (index !== -1) {
                $scope.contentResultsList.splice(index, 1);
            }
            c.destroy();
        }
        else {
            $scope.conversationsCache.remove(c);
        }

        if ($scope.cvs().indexOf($scope.activeConversation) === -1) {
            $scope.showConversation($scope.cvs()[0], false);
        }
        else {
            $scope.showConversation($scope.activeConversation, false);
        }
    });
};

$scope.removeSelected = function() {
    wdAlert.confirm(
        $scope.$root.DICT.messages.CONFIRM_DELETE_TITLE,
        $scope.$root.DICT.messages.CONFIRM_DELETE_CONTENT,
        $scope.$root.DICT.messages.CONFIRM_DELETE_OK,
        $scope.$root.DICT.messages.CONFIRM_DELETE_CANCEL
    ).then(function() {
        var selected = $scope.cvs().filter(function(c) {
            return c.selected;
        }).reduce(function(mem, c) {
            if (c.isSearchResult) {
                var index = $scope.contentResultsList.indexOf(c);
                if (index !== -1) {
                    $scope.contentResultsList.splice(index, 1);
                }
            }
            else {
                mem.push(c);
            }
            return mem;
        }, []);

        $scope.conversationsCache.remove(selected);

        if ($scope.cvs().indexOf($scope.activeConversation) === -1) {
            $scope.showConversation($scope.cvs()[0], false);
        }
        else {
            $scope.showConversation($scope.activeConversation, false);
        }

    });
};

$scope.removeMessage = function(c, m) {
    wdAlert.confirm(
        $scope.$root.DICT.messages.CONFIRM_DELETE_TITLE,
        $scope.$root.DICT.messages.CONFIRM_DELETE_CONTENT,
        $scope.$root.DICT.messages.CONFIRM_DELETE_OK,
        $scope.$root.DICT.messages.CONFIRM_DELETE_CANCEL
    ).then(function() {
        $scope.conversationsCache.removeMessages(c, m);
        if ($scope.cvs().indexOf($scope.activeConversation) === -1) {
            $scope.showConversation($scope.cvs()[0]);
        }
        else {
            $scope.showConversation($scope.activeConversation);
        }

    });
};

$scope.isDisplayNamePhoneNumber = function( name ) {

    //以数字、星号、加号、减号、警号开头并且结尾的
    return new RegExp(/^[\d\*\+\-\#]*$/g).test( name );
};

$scope.requestDesktopNotificationPermission = function () {
    wdDesktopNotification.requestPermission();
};

// Startup
var timer;
if ($scope.serverMatchRequirement) {
    $q.when($scope.conversations.hasFetched() || $scope.conversations.fetch()).then(function() {
        if (!$scope.activeConversation) {
            $scope.showConversation($scope.conversations.collection[0]);
        }
        $scope.cvsListFirstLoading = false;
    });

    timer = $timeout(function update() {
       timer = $timeout(update, 60000 - Date.now() % 60000);
    }, 60000 - Date.now() % 60000);

    var c;
    if ($route.current.params.create) {
        var parts = $route.current.params.create.split(',');
        c = $scope.createConversation();
        c.extend({
            addresses: [decodeURIComponent(parts[0])],
            contact_names: [decodeURIComponent(parts[1])],
            contact_ids: [-1],
            photo_paths: [''],
            date: Date.now()
        });
        $location.search('create', null).replace();
    }
    else if ($route.current.params.show) {
        var cid = $route.current.params.show;
        c = $scope.conversations.getById(cid);
        if (c) {
            $scope.showConversation(c);
        } else {
            $scope.conversations.fetch(cid).then(function(c) {
                $scope.showConversation(c);
            });
        }
        $location.search('show', null).replace();
    }
}

var keyboardScope = wdKey.push('messages');

wdKey.$apply('up, k', 'messages', function() {
    GA('messages:keyboard:up');
    var index = $scope.cvs().indexOf($scope.activeConversation);
    if (index === -1) { return; }
    if (index > 0) {
        $scope.showConversation($scope.cvs()[index - 1]);
    }
    return false;
});
wdKey.$apply('down, j', 'messages', function() {
    GA('messages:keyboard:down');
    var index = $scope.cvs().indexOf($scope.activeConversation);
    if (index === -1) { return; }
    if (index < $scope.cvs().length - 1) {
        $scope.showConversation($scope.cvs()[index + 1]);
    }
    return false;
});

// Shutdown
$scope.$on('$destroy', function() {
    $timeout.cancel(timer);
    $scope.conversations.off('.wdm');
    keyboardScope.done();
    wdKey.deleteScope('messages');
    if ($scope.conversationsCache.contains($scope.activeConversation)) {
        $scope.activeConversation.allRead();
    }
});

//=================================================================================
function getAvatarClass(index) {

    //默认头像显示颜色
    var photoColorList = [
        'contact-photo-bg-green',
        'contact-photo-bg-red',
        'contact-photo-bg-blue',
        'contact-photo-bg-pink',
        'contact-photo-bg-orange',
        'contact-photo-bg-wheat',
        'contact-photo-bg-olive-green',
        'contact-photo-bg-blue-green',
        'contact-photo-bg-light-green'
    ];
    return photoColorList[ index % photoColorList.length ];
}

function scrollIntoView() {
    _.defer(function() {
        $scope.$broadcast('wdm:autoscroll:bottom');
    });
}

/**
 * Active a conversation in conversations list of current view.
 * @param  {Conversation} c
 * @return {Promise}    Resolved by newly active conversation.
 */
function activeConversation(c) {
    var defer = $q.defer();
    if ($scope.activeConversation === c) {
        defer.reject('pass');
    }
    else {
        var curActiveCvs = $scope.activeConversation;

        if ($scope.conversationsCache.contains(curActiveCvs)) {
            curActiveCvs.allRead();
        }
        // Change c content right now.
        $scope.activeConversation = c;
        $scope.cvsChanging = true;

        // If already read any message, just active it.
        // Or load messages.
        if (c.messages.length || c.loaded) {
            $scope.cvsChanging = false;
            defer.resolve(c);
        }
        else {
            var preloading;

            if (c.isSearchResult && !$scope.conversations.contains(c)) {
                // When active a results conversation, preload it.
                var copy = $scope.conversationsCache.create(c.rawData);
                $scope.conversationsCache.add(copy);
                preloading = copy.fetch().then(function() {
                    return c;
                }, function() {
                    return c;
                });
            }
            else {
                preloading = $q.when(c);
            }

            preloading.then(function() {
                // Normal conversation will fetch it's latest messages.
                // Results conversation will fetch it's first result messages set.
                return c.messages.fetch();
            }).then(function done() {
                $scope.cvsChanging = false;
                defer.resolve(c);
            }, function error() {
                $scope.cvsChanging = false;
                defer.reject();
            });
        }
    }
    return defer.promise;
}

}];
});
