define([
    'io',
    'underscore',
    'jquery'
], function(
    io,
    _,
    $
) {
'use strict';

return ['wdEventEmitter', '$rootScope', 'wdDev', '$log', 'GA', 'wdGoogleSignIn', 'wdDevice',
function(wdEventEmitter,   $rootScope,   wdDev,   $log,   GA,   wdGoogleSignIn,   wdDevice) {

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
    RECONNECT_TIMES : 0,
    MAX_RECONNECTION_ATTEMPTS : 2,
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
            'connect timeout': 3000
        });
    },

    connect: function() {
        if (this._transport) { return; }

        this._newTransport();

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
            if (!lastTimestamp) {
                self._transport.emit({
                    type: 'timestamp.sync',
                });
            }
            
            GA('socket:connect');
            self.trigger('socket:connected');
        });

        this._transport.on('disconnect', function disconnect() {
            $log.error('Socket disconnected!');
        });

        this._transport.on('reconnecting', function reconnecting(reconnectionDelay, reconnectionAttempts) {
            $log.log('Socket will try reconnect after ' + reconnectionDelay + ' ms, for ' + reconnectionAttempts + ' times.');
           
            if (reconnectionAttempts === self.MAX_RECONNECTION_ATTEMPTS) {
                self.refreshDeviceAndConnect();
            }
        });

        this._transport.on('reconnect', function reconnect() {
            $log.log('Socket reconnected!');

            self.trigger('socket:connected');
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
            try {
                this._transport.disconnect();
            }
            catch(err){
            }

            this._transport.removeAllListeners();
            this._transport = null;
        }
        return this;
    },

    refreshDeviceAndConnect: function() {
        var self = this;
        var MAX_GET_DEVICES_TIMES = 3;
        (function getDevices() {
            wdGoogleSignIn.getDevices().then(function(list) {
                var device = wdDevice.getDevice();

                var currentOnlineDevice = _.find(list, function(item) {
                    return device && (item.id === device.id);
                });

                if (currentOnlineDevice && currentOnlineDevice.ip) {
                    if (currentOnlineDevice.ip !== device.ip) {
                        wdDevice.setDevice(currentOnlineDevice);
                        wdDev.setServer(currentOnlineDevice.ip);

                        self.close();
                        self.connect();
                    } else {
                        var url = 'https://push.snappea.com/accept?data=d2FrZV91cA==';
                        $.ajax({
                            type: 'GET',
                            url: url,
                            dataType: 'jsonp',
                            data: {
                                did: device.id,
                                google_token: wdGoogleSignIn.getStorageItem('googleToken')
                            }
                        });

                        self.trigger('socket:disconnected');

                        self.off('socket:connect').on('socket:connect', function() {
                            self.close();
                            self.connect();
                        });
                    }
                } else {
                    wdDevice.signout();
                }
            }, function() {
                MAX_GET_DEVICES_TIMES -= 1;
                if (MAX_GET_DEVICES_TIMES) {
                    getDevices();
                } else {
                    wdDevice.signout();
                }
            });
        })();
    }
};

return new Socket();

}];
});
