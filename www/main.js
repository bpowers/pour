var main = (function() {
    var SCALE_SERVICE_UUID = '00001820-0000-1000-8000-00805f9b34fb';
    var SCALE_CHARACTERISTIC_UUID = '00002a80-0000-1000-8000-00805f9b34fb';

    var TARE_PACKET = [0xdf, 0x78, 0x7, 0xc, 0x3, 0x0, 0x2, 0x50, 0x50, 0xb1];

    var Event = require('org.chromium.common.events');

    function ScaleFinder() {
        this.devices = {}
        this.scales = {};
        this.adapterState = null;

        this.onDiscoveryStateChanged = new Event('ScaleFinder.onDiscoveryStateChanged');
        this.onScaleAdded = new Event('ScaleFinder.onScaleAdded');
        this.onScaleRemoved = new Event('ScaleFinder.onScaleRemoved');

        chrome.bluetooth.onAdapterStateChanged.addListener(this.adapterStateChanged.bind(this));
        chrome.bluetooth.onDeviceAdded.addListener(this.deviceAdded.bind(this));
        chrome.bluetoothLowEnergy.onServiceAdded.addListener(this.serviceAdded.bind(this));

        chrome.bluetooth.getAdapterState(this.adapterStateChanged.bind(this));
    }

    ScaleFinder.prototype.adapterStateChanged = function(adapterState) {
        if (chrome.runtime.lastError) {
            console.log('adapter state changed: ' + chrome.runtime.lastError.message);
            return;
        }
        console.log('adapter state changed:');
        console.log(adapterState);

        var shouldFire = this.adapterState.discovering !== adapterState.discovering;

        this.adapterState = adapterState;

        if (shouldFire)
            this.onDiscoveryStateChanged.fire(adapterState.discovering);
    };

    ScaleFinder.prototype.deviceAdded = function(device) {
        if (!device.uuids || device.uuids.indexOf(SCALE_SERVICE_UUID) < 0)
            return;

        if (device.address in this.devices) {
            console.log('WARN: device added that is already known ' + device.address);
            return;
        }
        this.devices[device.address] = device;

        device.connect();
    };

    ScaleFinder.prototype.serviceAdded = function(service) {
        if (service.uuid !== SCALE_SERVICE_UUID)
            return;

        var scale = new Scale(device);
        this.scales[device.address] = scale;
        this.onDeviceAdded.fire(scale);

    }

    ScaleFinder.prototype.logDiscovery = function() {
        if (chrome.runtime.lastError)
            console.log('Failed to frob discovery: ' +
                        chromium.runtime.lastError.message);
    };

    ScaleFinder.prototype.startDiscovery = function() {
        chrome.bluetooth.startDiscovery(this.logDiscovery);
    }

    ScaleFinder.prototype.stopDiscovery = function() {
        chrome.bluetooth.stopDiscovery(this.logDiscovery);
    }


    function Scale(device, service) {
        this.initialized = false;
        this.device = device;
        this.service = service;
        this.characteristic = null;

        this.onReady = new Event('Scale.onReady');

        chrome.bluetoothLowEnergy.getCharacteristics(
            this.service.instanceId,
            this.allCharacteristics.bind(this));

        console.log('created scale for ' + this.device.address + ' (' + this.device.name + ')');
    }

    Scale.prototype.logError = function() {
        if (chrome.runtime.lastError)
            console.log('bluetooth call failed: ' + chrome.runtime.lastError.message);
    };

    Scale.prototype.tare = function() {
        if (!scale.initialized)
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
            console.log('failed listing characteristics: ' + chrome.runtime.lastError.message);
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
            console.log('failed enabling characteristic notifications: ' + chrome.runtime.lastError.message);
            // FIXME(bp) exit early once this call succeeds on android.
            //return;
        }

        console.log('scale ready');
        this.initialized = true;
        this.onReady.fire();
    };

    function PourApp() {
        this.finder = new ScaleFinder();
        this.finder.onDiscoveryStateChanged.addListener(updateDiscoveryToggleState);
    }

    PourApp.prototype.updateDiscoveryToggleState = function(discovering) {
        UI.getInstance().setDiscoveryToggleState(discovering);
    };

    PourApp.prototype.init = function() {
        var self = this;

        // Set up discovery toggle button handler
        UI.getInstance().setDiscoveryToggleHandler(function() {
            if (!this.discovering)
                this.finder.startDiscovery();
            else
                this.finder.stopDiscovery();
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
