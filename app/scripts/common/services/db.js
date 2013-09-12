define([], function() {
'use strict';

return ['$q', '$window', '$rootScope', function($q, $window, $rootScope) {

var VERSION = 1;

function Database(name) {
    this.name = name;
    this.defer = $q.defer();
    this.promise = this.defer.promise;
    this.db = null;
    this.status = 'init';
}

Database.prototype.open = function() {
    var self = this;
    var req = $window.indexedDB.open(this.name, VERSION);

    this.status = 'connecting';

    req.onupgradeneeded = function(e) {
        var db = e.target.result;
        db.createObjectStore('contactsIndex', {keyPath: 'id'});
        db.createObjectStore('flags');

        self.status = 'upgrading';
    };

    req.onsuccess = function(e) {
        self.db = e.target.result;
        self.status = 'connected';
        $rootScope.$apply(function() {
            self.defer.resolve(self.db);
        });
    };

    req.onerror = function(e) {
        $rootScope.$apply(function() {
            self.defer.reject('error');
        });
    };

    req.onblocked = function(e) {
        $rootScope.$apply(function() {
            self.defer.reject('blocked');
        });
    };

    return this;
};

Database.prototype.close = function() {
    if (this.db) {
        this.db.close();
        this.db = null;
    }
    this.defer.reject('close');
};

var singleton = null;

return {
    open: function(name) {
        this.close();
        singleton = new Database(name);
        singleton.open();
        return singleton;
    },
    close: function() {
       if (singleton) {
            singleton.close();
        }
    },
    current: function() {
        return singleton;
    }
};

}];

});
