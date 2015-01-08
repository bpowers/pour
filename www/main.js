var main = (function() {
    var SCALE_SERVICE_UUID = '00001820-0000-1000-8000-00805f9b34fb';
    var SCALE_CHARACTERISTIC_UUID = '00002a80-0000-1000-8000-00805f9b34fb';

    var TARE_PACKET = [0xdf, 0x78, 0x7, 0xc, 0x3, 0x0, 0x2, 0x50, 0x50, 0xb1];

    function PourApp() {
        this.deviceAddress = null;
        this.serviceId = null;
        this.characteristicId = null;
        this.initialized = false;
        this.discovering = false;
    }

    PourApp.prototype.updateDiscoveryToggleState = function(discovering) {
        if (this.discovering !== discovering) {
            this.discovering = discovering;
            UI.getInstance().setDiscoveryToggleState(this.discovering);
        }
    };

    PourApp.prototype.logError = function() {
        if (chrome.runtime.lastError)
            console.log('bluetooth call failed: ' + chrome.runtime.lastError.message);
    };

    PourApp.prototype.logDiscovery = function() {
        if (chrome.runtime.lastError)
            console.log('Failed to ' + (this.discovering ? 'stop' : 'start') +
                        ' discovery ' + chromium.runtime.lastError.message);
    };


    PourApp.prototype.ready = function() {
        console.log('ready - setting tare');
        document.getElementById('device-status').innerHTML += ' RDY';

        var buf = new ArrayBuffer(32);
        var bytes = new Uint8Array(buf);

        for (var i = 0; i < TARE_PACKET.length; i++)
            bytes[i] = TARE_PACKET[i] & 0xff;

        var self;
        console.log('writing tare');
        console.log(this.characteristicId);
        chrome.bluetoothLowEnergy.writeCharacteristicValue(this.characteristicId, buf, function() {
            if (chrome.runtime.lastError)
                console.log(chrome.runtime.lastError.message);
            console.log('write callback');
            console.log(arguments);
        });
    };

    PourApp.prototype.serviceAdded = function(service) {
        if (service.uuid !== SCALE_SERVICE_UUID)
            return;

        this.serviceId = service.instanceId;
        console.log('service added!');

        var self = this;
        var notificationsSet = function() {
            if (chrome.runtime.lastError)
                console.log('failed enabling characteristic notifications: ' + chrome.runtime.lastError.message);

            self.initialized = true;
            self.ready();
        }

        var allCharacteristics = function(characteristics) {
            console.log('all chars');
            if (chrome.runtime.lastError) {
                console.log('failed listing characteristics: ' + chrome.runtime.lastError.message);
                return;
            }

            var found = false;
            for (var i = 0; i < characteristics.length; i++) {
                if (characteristics[i].uuid == SCALE_CHARACTERISTIC_UUID) {
                    self.characteristicId = characteristics[i].instanceId;
                    found = true;
                    break;
                }
            }

            if (found) {
                console.log('starting char notifications');
                chrome.bluetoothLowEnergy.startCharacteristicNotifications(self.characteristicId, notificationsSet);
            } else {
                console.log('scale doesnt have required characteristic');
                console.log(characteristics);
            }
        }
        chrome.bluetoothLowEnergy.getCharacteristics(this.serviceId, allCharacteristics);

        document.getElementById('device-status').innerHTML += ' CONN';
    };

    PourApp.prototype.init = function() {
        var self = this;

        var updateAdapterState = function(adapterState) {
            UI.getInstance().setAdapterState(adapterState.address, adapterState.name);
            self.updateDiscoveryToggleState(adapterState.discovering);
            if (chrome.runtime.lastError)
                console.log(chrome.runtime.lastError.message);
        };

        chrome.bluetooth.getAdapterState(function (adapterState) {
            if (chrome.runtime.lastError)
                console.log(chrome.runtime.lastError.message);

            self.updateDiscoveryToggleState(adapterState.discovering);
            updateAdapterState(adapterState);
        });

        var deviceAdded = function(device) {
            if (!device.uuids || device.uuids.indexOf(SCALE_SERVICE_UUID) < 0)
                return;

            self.deviceAddress = device.address;

            document.getElementById('device-status').innerHTML = 'discovered: ' + device.name;

            chrome.bluetooth.stopDiscovery(self.logDiscovery.bind(self));
            chrome.bluetoothLowEnergy.connect(device.address, self.logError);
        }

        chrome.bluetooth.onAdapterStateChanged.addListener(updateAdapterState);
        chrome.bluetooth.onDeviceAdded.addListener(deviceAdded);
        chrome.bluetoothLowEnergy.onServiceAdded.addListener(this.serviceAdded.bind(this));

        // Set up discovery toggle button handler
        UI.getInstance().setDiscoveryToggleHandler(function() {
            if (!self.discovering)
                chrome.bluetooth.startDiscovery(self.logDiscovery.bind(self));
            else
                chrome.bluetooth.stopDiscovery(self.logDiscovery.bind(self));
        });
    };

    return {
        PourApp: PourApp,
    };
})();

document.addEventListener('DOMContentLoaded', function() {
    var app = new main.PourApp();
    app.init();
});
