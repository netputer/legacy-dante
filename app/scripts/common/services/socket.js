define([
    'io'
], function(
    io
) {
'use strict';

return ['wdEventEmitter', '$rootScope', 'wdDev', '$log', 'GA',
function(wdEventEmitter,   $rootScope,   wdDev,   $log,   GA) {

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
    MAX_RECONNECTION_ATTEMPTS : 10,
    /**
     * Destroy everything.
     */
    destroy: function() {
        this.close();
        this.off();
        return this;
    },

    connect: function() {
        if (this._transport) { return; }

        this._transport = io.connect(wdDev.getSocketServer(), {
            transports: [
                'websocket',
                'htmlfile',
                'xhr-multipart',
                'xhr-polling',
                'jsonp-polling'
            ],
            'max reconnection attempts': this.MAX_RECONNECTION_ATTEMPTS
        });

        this._delegateEventListeners();

        return this;
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
            self._transport.emit({
                type: 'timestamp.sync',
            });
            GA('socket:connect');
        });

        this._transport.on('disconnect', function disconnect() {
            $log.error('Socket disconnected!');
        });

        this._transport.on('reconnecting', function reconnecting(reconnectionDelay, reconnectionAttempts) {
            $log.log('Socket will try reconnect after ' + reconnectionDelay + ' ms, for ' + reconnectionAttempts + ' times.');
            if (reconnectionAttempts === self.MAX_RECONNECTION_ATTEMPTS) {
                $log.error('Socket reconnect failed. Now start connect again.');

                self._transport.socket.reconnect();
            }
        });

        this._transport.on('reconnect', function reconnect() {
            $log.log('Socket reconnected!');

            self._transport.emit({
                type: 'notifications.request',
                timestamp : lastTimestamp 
            });
        });

        // There is a bug in socket.io, reconnect_failed gets never fired.
        this._transport.on('reconnect_failed', function failed() {
            $log.warn('Socket server seems cold dead...');
            GA('socket:dead');
        });

        this._transport.on('connect_failed', function() {
            // $log.warn('Socket fails to establish.');
            GA('socket:connect_failed');
        });
    },

    close: function() {
        if (this._transport) {
            this._transport.disconnect();
            this._transport.removeAllListeners();
            this._transport = null;
        }
        return this;
    }
};

return new Socket();

}];
});
