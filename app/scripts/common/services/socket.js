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

return ['wdEventEmitter', '$rootScope', 'wdDev', '$log', 'GA', 'wdGoogleSignIn', 'wdDevice', '$injector', '$q',
function(wdEventEmitter,   $rootScope,   wdDev,   $log,   GA,   wdGoogleSignIn,   wdDevice,   $injector,   $q) {

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
    MAX_SOCKET_CONNECT_TIMES: 3,
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
                    self.showDisconnectPanel();   
                }
                self.defer.reject();
            });
            
            $log.error('Socket disconnected!');
        });

        this._transport.on('reconnecting', function reconnecting(reconnectionDelay, reconnectionAttempts) {
            $log.log('Socket will try reconnect after ' + reconnectionDelay + ' ms, for ' + reconnectionAttempts + ' times.');
           
            if (reconnectionAttempts === self.MAX_RECONNECTION_ATTEMPTS) {
                self.showDisconnectPanel();
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
            $rootScope.$apply(function() {
                self.defer.resolve();
            });
            GA('socket:dead');
        });

        this._transport.on('connect_failed', function() {
            // $log.warn('Socket fails to establish.');

            $rootScope.$apply(function() {
                self.defer.resolve();
            });
            GA('socket:connect_failed');
        });

        this._transport.on('error', function() {
            //Almost handshake error
            $rootScope.$apply(function() {
                self.defer.resolve();
            });
            self.showDisconnectPanel(true);
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
        this.defer.reject();
        return this;
    },

    showDisconnectPanel: function(forceRefreshRetyTimes) {
        this.trigger('socket:disconnected', [forceRefreshRetyTimes]);
    },

    refreshDeviceAndConnect: function() {
        var defer = $q.defer();
        var self = this;
        //this.MAX_SOCKET_CONNECT_TIMES = 3;
        wdGoogleSignIn.getDevices().then(function(list) {
            var device = wdDevice.getDevice();

            var currentOnlineDevice = _.find(list, function(item) {
                return device && (item.id === device.id);
            });

            if (currentOnlineDevice) {
                if (!currentOnlineDevice.ip) {
                    $injector.invoke(['wdConnect', function(wdConnect) {
                        wdConnect.remoteConnectWithRetry(currentOnlineDevice).then(function(data) {
                            wdDev.setRequestWithRemote(data);

                            wdConnect.connectDeviceWithRetry(currentOnlineDevice).then(function() {
                                wdDev.setRemoteConnectionData(data);
                                self.close();
                                self.connect().then(function() {
                                    defer.resolve();
                                }, function() {
                                    defer.reject();
                                });
                            }, function() {
                                defer.reject();
                            }).always(function() {
                                wdDev.setRequestWithRemote(false);
                            });
                        }, function(){
                            defer.reject();
                        });
                    }]);
                } else {
                    wdDevice.lightDeviceScreen(device.id);
                    wdDev.closeRemoteConnection();
                    $injector.invoke(['wdConnect', function(wdConnect) {
                        wdConnect.connectDeviceWithRetry(currentOnlineDevice).then(function() {
                            self.close();
                            self.connect().then(function(){
                                defer.resolve();
                            });
                        }, function() {
                            wdConnect.remoteConnectWithRetry(currentOnlineDevice).then(function(data){
                                wdDev.setRequestWithRemote(data);

                                wdConnect.connectDeviceWithRetry(currentOnlineDevice).then(function() {
                                    wdDev.setRemoteConnectionData(data);
                                    self.close();
                                    self.connect().then(function() {
                                        defer.resolve();
                                    }, function() {
                                        defer.reject();
                                    });
                                }, function() {
                                    defer.reject();
                                }).always(function() {
                                    wdDev.setRequestWithRemote(false);
                                });
                            }, function() {
                                defer.reject();
                            });
                        });
                    }]);
                }
            } else {
                defer.reject();
            }
        }, function(xhr) {
            GA('check_sign_in:get_devices_failed:xhrError_' + xhr.status + '_socketRefreshDeviceAndConnectFailed');
            defer.reject();
        });

        return defer.promise;
    }
};

return new Socket();

}];
});
