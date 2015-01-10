var main = (function() {
    var SCALE_SERVICE_UUID = '00001820-0000-1000-8000-00805f9b34fb';
    var SCALE_CHARACTERISTIC_UUID = '00002a80-0000-1000-8000-00805f9b34fb';

    var TARE_PACKET = [0xdf, 0x78, 0x7, 0xc, 0x3, 0x0, 0x2, 0x50, 0x50, 0xb1];

    /**
     * Creates a new EventTarget. This class implements the DOM level 2
     * EventTarget interface and can be used wherever those are used.
     * @constructor
     * @implements {EventTarget}
     *
     * BSD-licensed, taken from Chromium: src/ui/webui/resources/js/cr/event_target.js
     */
    function EventTarget() {
    }

    EventTarget.prototype = {
        /**
         * Adds an event listener to the target.
         * @param {string} type The name of the event.
         * @param {EventListenerType} handler The handler for the event. This is
         *     called when the event is dispatched.
         */
        addEventListener: function(type, handler) {
            if (!this.listeners_)
                this.listeners_ = Object.create(null);
            if (!(type in this.listeners_)) {
                this.listeners_[type] = [handler];
            } else {
                var handlers = this.listeners_[type];
                if (handlers.indexOf(handler) < 0)
                    handlers.push(handler);
            }
        },

        /**
         * Removes an event listener from the target.
         * @param {string} type The name of the event.
         * @param {EventListenerType} handler The handler for the event.
         */
        removeEventListener: function(type, handler) {
            if (!this.listeners_)
                return;
            if (type in this.listeners_) {
                var handlers = this.listeners_[type];
                var index = handlers.indexOf(handler);
                if (index >= 0) {
                    // Clean up if this was the last listener.
                    if (handlers.length == 1)
                        delete this.listeners_[type];
                    else
                        handlers.splice(index, 1);
                }
            }
        },

        /**
         * Dispatches an event and calls all the listeners that are listening to
         * the type of the event.
         * @param {!Event} event The event to dispatch.
         * @return {boolean} Whether the default action was prevented. If someone
         *     calls preventDefault on the event object then this returns false.
         */
        dispatchEvent: function(event) {
            if (!this.listeners_)
                return true;

            // Since we are using DOM Event objects we need to override some of the
            // properties and methods so that we can emulate this correctly.
            var self = this;
            event.__defineGetter__('target', function() {
                return self;
            });

            var type = event.type;
            var prevented = 0;
            if (type in this.listeners_) {
                // Clone to prevent removal during dispatch
                var handlers = this.listeners_[type].concat();
                for (var i = 0, handler; handler = handlers[i]; i++) {
                    if (handler.handleEvent)
                        prevented |= handler.handleEvent.call(handler, event) === false;
                    else
                        prevented |= handler.call(this, event) === false;
                }
            }

            return !prevented && !event.defaultPrevented;
        }
    };

    function ScaleFinder() {
        this.ready = false;
        this.devices = {}
        this.scales = {};
        this.scaleReadyCallbacks = {};
        this.adapterState = null;

        chrome.bluetooth.onAdapterStateChanged.addListener(this.adapterStateChanged.bind(this));
        chrome.bluetooth.onDeviceAdded.addListener(this.deviceAdded.bind(this));
        chrome.bluetoothLowEnergy.onServiceAdded.addListener(this.serviceAdded.bind(this));

        chrome.bluetooth.getAdapterState(this.adapterStateChanged.bind(this));
    }

    ScaleFinder.prototype = new EventTarget();

    ScaleFinder.prototype.adapterStateChanged = function(adapterState) {
        if (chrome.runtime.lastError) {
            console.log('adapter state changed: ' + chrome.runtime.lastError.message);
            return;
        }

        var shouldDispatchReady = !this.adapterState;
        var shouldDispatchDiscovery = this.adapterState && this.adapterState.discovering !== adapterState.discovering;

        this.adapterState = adapterState;

        if (shouldDispatchReady)
            this.dispatchEvent(new Event('ready'));
        if (shouldDispatchDiscovery) {
            var event = new CustomEvent(
                'discoveryStateChanged',
                {'detail': {'discovering': adapterState.discovering}});
            this.dispatchEvent(event);
        }
    };

    ScaleFinder.prototype.deviceAdded = function(device) {
        if (!device.uuids || device.uuids.indexOf(SCALE_SERVICE_UUID) < 0)
            return;

        if (device.address in this.devices) {
            console.log('WARN: device added that is already known ' + device.address);
            return;
        }
        this.devices[device.address] = device;

        chrome.bluetoothLowEnergy.connect(device.address,
                                          {'persistent': true},
                                          this.deviceConnected.bind(this));
    };

    ScaleFinder.prototype.deviceConnected = function() {
        if (chrome.runtime.lastError)
            console.log('connect failed: ' + chrome.runtime.lastError.message);
    };

    ScaleFinder.prototype.serviceAdded = function(service) {
        if (service.uuid !== SCALE_SERVICE_UUID)
            return;

        var device = this.devices[service.deviceAddress];
        var scale = new Scale(device, service);
        this.scales[device.address] = scale;
        var readyCallback = this.scaleReady.bind(this)
        this.scaleReadyCallbacks[scale] = readyCallback;

        // to simplify development elsewhere, fire the ScaleFinder's
        // scaleAdded event after the scale is ready to be used.
        scale.addEventListener('ready', readyCallback);
    }

    ScaleFinder.prototype.scaleReady = function(event) {
        var scale = event.detail.scale;
        var readyCallback = this.scaleReadyCallbacks[scale];
        scale.removeEventListener('ready', readyCallback);
        delete this.scaleReadyCallbacks[scale];

        var event = new CustomEvent('scaleAdded', {'detail': {'scale': scale}});
        this.dispatchEvent(event);
    }

    ScaleFinder.prototype.logDiscovery = function() {
        if (chrome.runtime.lastError)
            console.log('Failed to frob discovery: ' +
                        chrome.runtime.lastError.message);
    };

    ScaleFinder.prototype.startDiscovery = function() {
        chrome.bluetooth.startDiscovery(this.logDiscovery);
    }

    ScaleFinder.prototype.stopDiscovery = function() {
        chrome.bluetooth.stopDiscovery(this.logDiscovery);
    }


    function Scale(device, service) {
        this.initialized = false;
        this.name = device.name;
        this.device = device;
        this.service = service;
        this.characteristic = null;

        this.onReady = new Event('Scale.onReady');

        chrome.bluetoothLowEnergy.getCharacteristics(
            this.service.instanceId,
            this.allCharacteristics.bind(this));

        console.log('created scale for ' + this.device.address + ' (' + this.device.name + ')');
    }

    Scale.prototype = new EventTarget();

    Scale.prototype.logError = function() {
        if (chrome.runtime.lastError)
            console.log('bluetooth call failed: ' + chrome.runtime.lastError.message);
    };

    Scale.prototype.tare = function() {
        if (!this.initialized)
            return false;

        var buf = new ArrayBuffer(16);
        var bytes = new Uint8Array(buf);

        for (var i = 0; i < TARE_PACKET.length; i++)
            bytes[i] = TARE_PACKET[i] & 0xff;

        chrome.bluetoothLowEnergy.writeCharacteristicValue(
            this.characteristic.instanceId, buf, this.logError.bind(this));

        return true;
    };

    Scale.prototype.allCharacteristics = function(characteristics) {
        if (chrome.runtime.lastError) {
            console.log('failed listing characteristics: ' +
                        chrome.runtime.lastError.message);
            return;
        }

        var found = false;
        for (var i = 0; i < characteristics.length; i++) {
            if (characteristics[i].uuid == SCALE_CHARACTERISTIC_UUID) {
                this.characteristic = characteristics[i];
                found = true;
                break;
            }
        }

        if (found) {
            chrome.bluetoothLowEnergy.startCharacteristicNotifications(
                this.characteristic.instanceId,
                this.notificationsReady.bind(this));
        } else {
            console.log('scale doesnt have required characteristic');
            console.log(characteristics);
        }
    };

    Scale.prototype.notificationsReady = function() {
        if (chrome.runtime.lastError) {
            console.log('failed enabling characteristic notifications: ' +
                        chrome.runtime.lastError.message);
            // FIXME(bp) exit early once this call succeeds on android.
            //return;
        }

        this.initialized = true;
        this.dispatchEvent(new CustomEvent('ready', {'detail': {'scale': this}}));
    };

    function PourApp() {
        this.finder = new ScaleFinder();
        this.finder.addEventListener('ready',
                                     this.finderReady.bind(this));
        this.finder.addEventListener('discoveryStateChanged',
                                     this.updateDiscoveryToggleState.bind(this));
        this.finder.addEventListener('scaleAdded',
                                     this.scaleAdded.bind(this));
    }

    PourApp.prototype.finderReady = function() {
        var addr = this.finder.adapterState.address;
        var name = this.finder.adapterState.name;
        UI.getInstance().setAdapterState(addr, name);
        UI.getInstance().setDiscoveryToggleEnabled(true);
    };

    PourApp.prototype.updateDiscoveryToggleState = function(event) {
        UI.getInstance().setDiscoveryToggleState(event.detail.discovering, !!this.scale);
    };

    PourApp.prototype.scaleAdded = function(event) {
        this.scale = event.detail.scale;

        this.finder.stopDiscovery();

        UI.getInstance().setDiscoveryToggleEnabled(false);
        UI.getInstance().setTareEnabled(true);
    }

    PourApp.prototype.init = function() {
        var self = this;

        UI.getInstance().setDiscoveryToggleHandler(function() {
            if (!this.discovering)
                this.finder.startDiscovery();
            else
                this.finder.stopDiscovery();
        }.bind(this));

        UI.getInstance().setTareHandler(function() {
            if (!this.scale) {
                console.log('ERROR: tare without scale.');
                return;
            }
            this.scale.tare();
        }.bind(this));
    };

    return {
        PourApp: PourApp,
    };
})();

document.addEventListener('DOMContentLoaded', function() {
    var app = new main.PourApp();
    app.init();
});
