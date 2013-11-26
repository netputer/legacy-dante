define([
    'underscore'
], function(
    _
) {
'use strict';
return ['wdmMessagesCollection', '$q', '$http', 'GA', 
function(wdmMessagesCollection,   $q,   $http,   GA) {

var _super = wdmMessagesCollection.MessagesCollection.prototype;

function SyncMessagesCollection(conversation) {
    _super.constructor.call(this);
    this._conversation = conversation;
    this.loaded = false;
}

SyncMessagesCollection.prototype = Object.create(_super, {
    /**
     * @override
     */
    empty: {get: function() { return !this.length && this.loaded; }}
});

_.extend(SyncMessagesCollection.prototype, {

    constructor: SyncMessagesCollection,

    /**
     * Create a Message and add into collection
     * @param  {Object} data
     * @return {}      [description]
     */
    create: function(data) {
        if (data.thread_id == null) {
            data.thread_id = this._conversation.id;
        }
        return _super.create.call(this, data);
    },

    sync: function(action, config, refresh) {
        var done = null;
        var fail = function() { return $q.reject(); };

        if (action === 'read') {

            config.method = 'GET';
            config.url = '/resource/conversations/' + this._conversation.id + '/messages';

            var timeStart = (new Date()).getTime();
            done = function(response) {
                GA('perf:messages_fetch_duration:success:' + ((new Date()).getTime() - timeStart));

                var data = [].concat(response.data);
                if (!refresh) {
                    this.loaded = response.headers('WD-Need-More') === 'false';
                }
                
                return this.add(data.map(this.create.bind(this)));
            }.bind(this);

            var RETRY_TIMES = 3;
            var promise = (function tick() {
                return $http(config).then(done, function() {
                    GA('perf:messages_fetch_duration:fail:' + ((new Date()).getTime() - timeStart));

                    RETRY_TIMES -= 1;
                    if (!RETRY_TIMES) {
                        return $q.reject();
                    } else {
                        tick();
                    }
                });
            })();

            return promise;
        }
        else {
            return $q.reject();
        }
    },

    remove: function(messages) {
        var self = this;

        messages = this.drop(messages);

        messages.filter(function(m) {
            return !m.isNew;
        });

        return $q.all(messages.map(function(m) {
            return m.destroy().then(function done() {
                return m;
            }, function fail() {
                // Add message back
                self.add(m);
                return m;
            });
        }));
    }



});

return {
    SyncMessagesCollection: SyncMessagesCollection,
    createSyncMessagesCollection: function(conversation) {
        return new SyncMessagesCollection(conversation);
    }
};
}];
});
