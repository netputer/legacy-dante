define([
    'io'
], function(
    io
) {
'use strict';

return ['wdEventEmitter', '$rootScope', 'wdDev', '$log', 'GA', '$q',
function(wdEventEmitter,   $rootScope,   wdDev,   $log,   GA,   $q) {

function Socket() {
    // Mixin event emitter behavior.
    wdEventEmitter(this);
    this._transport = null;
}
/*
 * Socket prototype
 */
Socket.prototype = {

    constructor: Socket,
    MAX_RECONNECTION_ATTEMPTS : 2,
    defer: null,
    /**
     * Destroy everything.
     */
    destroy: function() {
        this.close();
        this.off();
        return this;
    },

    _newTransport: function() {
        this._transport = io.connect(wdDev.getSocketServer(), {
            transports: [
                'websocket',
                'htmlfile',
                'xhr-multipart',
                'xhr-polling',
                'jsonp-polling'
            ],
            'max reconnection attempts': this.MAX_RECONNECTION_ATTEMPTS,
            'connect timeout': 3000,
            'reconnection delay': 100,
            'force new connection': true
        });
    },

    connect: function() {
        if (this._transport) { return; }
        this.defer = $q.defer();

        this._newTransport();

        this._delegateEventListeners();

        return this.defer.promise;
    },

    _delegateEventListeners: function() {
        if (!this._transport) { return; }

        var self = this;
        var lastTimestamp = 0;

        this._transport.on('message', function onMessage(message) {
            try {
                message = JSON.parse(message);
            }
            catch (err) {
                $log.warn('Invalid message data: ', message);
                return;
            }
            $log.log('socket: ', message);
            lastTimestamp = message.timestamp;
            $rootScope.$apply(function() {
                self.trigger(message.type.replace('.', '_'), [message]);
            });
        });

        this._transport.on('connect', function() {
            if (!lastTimestamp) {
                self._transport.emit({
                    type: 'timestamp.sync',
                });
            }
            
            self.trigger('socket:connected');
            $rootScope.$apply(function() {
                self.defer.resolve();
            });

            GA('socket:connect');
        });

        this._transport.on('disconnect', function disconnect() {
            $rootScope.$apply(function() {
                if (wdDev.isRemoteConnection()) {
                    self.trigger('socket:disconnected'); 
                }
                self.defer.reject();
            });
            
            $log.error('Socket disconnected!');
        });

        this._transport.on('reconnecting', function reconnecting(reconnectionDelay, reconnectionAttempts) {
            $log.log('Socket will try reconnect after ' + reconnectionDelay + ' ms, for ' + reconnectionAttempts + ' times.');
           
            if (reconnectionAttempts === self.MAX_RECONNECTION_ATTEMPTS) {
                self.trigger('socket:disconnected'); 
            }
        });

        this._transport.on('reconnect', function reconnect() {
            $log.log('Socket reconnected!');

            self.trigger('socket:connected');
            self._transport.emit({
                type: 'notifications.request',
                timestamp : lastTimestamp 
            });
            $rootScope.$apply(function() {
                self.defer.resolve();
            });
            
        });

        // There is a bug in socket.io, reconnect_failed gets never fired.
        this._transport.on('reconnect_failed', function failed() {
            $log.warn('Socket server seems cold dead...');
            GA('socket:dead');
        });

        this._transport.on('connect_failed', function() {
            // $log.warn('Socket fails to establish.');

            $rootScope.$apply(function() {
                self.defer.reject();
            });
            GA('socket:connect_failed');
        });

        this._transport.on('error', function() {
            //Almost handshake error
            $rootScope.$apply(function() {
                self.defer.reject();
            });
            GA('socket:connect_error');
        });
    },

    close: function() {
        if (this._transport) {
            try {
                this._transport.disconnect();
            }
            catch(err){
            }

            if (this._transport) {
                this._transport.removeAllListeners();
                this._transport = null;
            }
        }
        return this;
    }
};

return new Socket();

}];
});
