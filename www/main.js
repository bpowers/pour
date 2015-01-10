var main = (function() {
    var SCALE_SERVICE_UUID = '00001820-0000-1000-8000-00805f9b34fb';
    var SCALE_CHARACTERISTIC_UUID = '00002a80-0000-1000-8000-00805f9b34fb';

    var TARE_PACKET = [0xdf, 0x78, 0x7, 0xc, 0x3, 0x0, 0x2, 0x50, 0x50, 0xb1];

    var TABLE1 = [
        0x00, 0x76, 0x84, 0x50, 0xDB, 0xE4, 0x6F, 0xB2,
        0xFA, 0xFB, 0x4D, 0x4F, 0x8E, 0x57, 0x8C, 0x5F,
        0x9E, 0xAE, 0xB0, 0xB5, 0x5D, 0x96, 0x15, 0xB9,
        0x0F, 0xFC, 0xFD, 0x70, 0x1B, 0x80, 0xBB, 0xF4,
        0x93, 0xFE, 0xFF, 0x69, 0x68, 0x83, 0xCF, 0xA7,
        0xD2, 0xEB, 0x3C, 0x64, 0x41, 0x77, 0xC6, 0x86,
        0xCB, 0xD3, 0xDD, 0x48, 0xEE, 0xF0, 0x1E, 0x58,
        0x4C, 0x8A, 0x8F, 0xA4, 0x02, 0x4B, 0x06, 0x24,
        0x8D, 0xB7, 0xBF, 0x28, 0x63, 0xAD, 0xB8, 0x56,
        0x89, 0xA0, 0xC4, 0x51, 0xC5, 0x52, 0x27, 0x3D,
        0xC9, 0xD6, 0xDC, 0x42, 0x2C, 0xD7, 0xE6, 0xEF,
        0xF9, 0x35, 0xD9, 0xBC, 0x7A, 0x1F, 0x43, 0x6C,
        0x36, 0x38, 0x07, 0x94, 0x98, 0xD8, 0xE3, 0xB6,
        0x53, 0x3F, 0x0C, 0x92, 0x9A, 0xC2, 0xD1, 0xD5,
        0x34, 0x1D, 0x62, 0xA9, 0x20, 0x7E, 0xAC, 0x09,
        0x5E, 0x59, 0x31, 0x9C, 0xA3, 0x97, 0xB3, 0x74,
        0xC1, 0xED, 0xF2, 0x10, 0x2E, 0x4A, 0xE1, 0x23,
        0x2B, 0x81, 0xF7, 0x61, 0x19, 0x08, 0x1A, 0x39,
        0x65, 0x3E, 0x73, 0x3B, 0x7B, 0x0B, 0x67, 0x04,
        0x6A, 0x22, 0x46, 0x0E, 0x55, 0x66, 0x54, 0x01,
        0x45, 0x6B, 0x32, 0x8B, 0xAB, 0x18, 0xBA, 0xCC,
        0xD4, 0x26, 0xE2, 0xE7, 0x1C, 0x44, 0x14, 0x95,
        0x99, 0x85, 0xDA, 0x4E, 0x6E, 0xE0, 0xE8, 0x37,
        0xBE, 0xF3, 0x7F, 0xDF, 0xF6, 0xF8, 0x2D, 0x30,
        0x21, 0x13, 0x17, 0x0D, 0x16, 0x25, 0x5B, 0x33,
        0x11, 0x5C, 0x7C, 0x87, 0xA1, 0xBD, 0x05, 0x90,
        0x9F, 0xA6, 0x6D, 0xB4, 0xC7, 0xCA, 0xC3, 0x12,
        0x03, 0xE5, 0xDE, 0xE9, 0x9B, 0x88, 0x2F, 0xEA,
        0xEC, 0xC8, 0x29, 0x71, 0x49, 0x5A, 0x72, 0x47,
        0x7D, 0xA2, 0xA5, 0x91, 0xAF, 0xB1, 0x0A, 0xCD,
        0x60, 0xC0, 0x9D, 0x78, 0xCE, 0xD0, 0x79, 0x3A,
        0xAA, 0xA8, 0x2A, 0x40, 0xF1, 0x75, 0xF5, 0x82,
    ];

    var TABLE2 = [
        0x00, 0x9F, 0x3C, 0xD8, 0x97, 0xCE, 0x3E, 0x62,
        0x8D, 0x77, 0xEE, 0x95, 0x6A, 0xC3, 0x9B, 0x18,
        0x83, 0xC8, 0xD7, 0xC1, 0xAE, 0x16, 0xC4, 0xC2,
        0xA5, 0x8C, 0x8E, 0x1C, 0xAC, 0x71, 0x36, 0x5D,
        0x74, 0xC0, 0x99, 0x87, 0x3F, 0xC5, 0xA9, 0x4E,
        0x43, 0xE2, 0xFA, 0x88, 0x54, 0xBE, 0x84, 0xDE,
        0xBF, 0x7A, 0xA2, 0xC7, 0x70, 0x59, 0x60, 0xB7,
        0x61, 0x8F, 0xF7, 0x93, 0x2A, 0x4F, 0x91, 0x69,
        0xFB, 0x2C, 0x53, 0x5E, 0xAD, 0xA0, 0x9A, 0xE7,
        0x33, 0xE4, 0x85, 0x3D, 0x38, 0x0A, 0xB3, 0x0B,
        0x03, 0x4B, 0x4D, 0x68, 0x9E, 0x9C, 0x47, 0x0D,
        0x37, 0x79, 0xE5, 0xC6, 0xC9, 0x14, 0x78, 0x0F,
        0xF0, 0x8B, 0x72, 0x44, 0x2B, 0x90, 0x9D, 0x96,
        0x24, 0x23, 0x98, 0xA1, 0x5F, 0xD2, 0xB4, 0x06,
        0x1B, 0xE3, 0xE6, 0x92, 0x7F, 0xFD, 0x01, 0x2D,
        0xF3, 0xF6, 0x5C, 0x94, 0xCA, 0xE8, 0x75, 0xBA,
        0x1D, 0x89, 0xFF, 0x25, 0x02, 0xB1, 0x2F, 0xCB,
        0xDD, 0x48, 0x39, 0xA3, 0x0E, 0x40, 0x0C, 0x3A,
        0xCF, 0xEB, 0x6B, 0x20, 0x63, 0xAF, 0x15, 0x7D,
        0x64, 0xB0, 0x6C, 0xDC, 0x7B, 0xF2, 0x10, 0xD0,
        0x49, 0xCC, 0xE9, 0x7C, 0x3B, 0xEA, 0xD1, 0x27,
        0xF9, 0x73, 0xF8, 0xA4, 0x76, 0x45, 0x11, 0xEC,
        0x12, 0xED, 0x07, 0x7E, 0xD3, 0x13, 0x67, 0x41,
        0x46, 0x17, 0xA6, 0x1E, 0x5B, 0xCD, 0xB8, 0x42,
        0xF1, 0x80, 0x6D, 0xD6, 0x4A, 0x4C, 0x2E, 0xD4,
        0xE1, 0x50, 0xD5, 0x30, 0xA7, 0xEF, 0xF4, 0x26,
        0xF5, 0x6E, 0x28, 0x31, 0xA8, 0x6F, 0x51, 0x55,
        0x65, 0x5A, 0xB2, 0x04, 0x52, 0x32, 0xDA, 0xBB,
        0xB5, 0x86, 0xAA, 0x66, 0x05, 0xD9, 0x56, 0xAB,
        0xB6, 0xDB, 0xDF, 0x29, 0xE0, 0x81, 0x34, 0x57,
        0x35, 0xFC, 0x82, 0xB9, 0x1F, 0xFE, 0xBC, 0x8A,
        0xBD, 0x58, 0x08, 0x09, 0x19, 0x1A, 0x21, 0x22,
    ];

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
