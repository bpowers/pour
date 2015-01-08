var main = (function() {
    var SCALE_SERVICE_UUID = '00001820-0000-1000-8000-00805f9b34fb';
    var SCALE_CHARACTERISTIC_UUID = '00002a80-0000-1000-8000-00805f9b34fb';

    var TARE_PACKET = [0xdf, 0x78, 0x7, 0xc, 0x3, 0x0, 0x2, 0x50, 0x50, 0xb1];

    function PourApp() {
        // A mapping from device addresses to device.
        this.deviceMap_ = {};

        this.deviceAddress = null;

        this.initialized = false;

        this.discovering_ = false;
    }

    PourApp.prototype.updateDiscoveryToggleState = function(discovering) {
        if (this.discovering_ !== discovering) {
            this.discovering_ = discovering;
            UI.getInstance().setDiscoveryToggleState(this.discovering_);
        }
    };

    PourApp.prototype.ready = function() {
        var fullID = this.deviceAddress + '/' + SCALE_CHARACTERISTIC_UUID;

        console.log('ready - setting tare');

        var buf = new ArrayBuffer(32);
        var bytes = new Uint8Array(buf);

        var i;
        for (i = 0; i < TARE_PACKET.length; i++)
            bytes[i] = TARE_PACKET[i] & 0xff;

        console.log('writing tare');
        chrome.bluetoothLowEnergy.writeCharacteristicValue(fullID, buf, function() {
            if (chrome.runtime.lastError)
                console.log(chrome.runtime.lastError);
            console.log('write callback');
            console.log(arguments);
        });
    };

    PourApp.prototype.init = function() {
        // Store the |this| to be used by API callbacks below.
        var self = this;

        // Request information about the local Bluetooth adapter to be displayed in
        // the UI.
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

            console.log('discovered: ' + device.name + ' at ' + device.address);
            self.deviceMap_[device.address] = device;
            document.getElementById('device-status').innerHTML = 'discovered: ' + device.name;
            var discoveryHandler = function() {
                if (chrome.runtime.lastError) {
                    console.log('Failed to ' + (self.discovering_ ? 'stop' : 'start') + ' discovery ' +
                                chromium.runtime.lastError.message);
                }
            };
            chrome.bluetooth.stopDiscovery(discoveryHandler);

            chrome.bluetoothLowEnergy.onServiceAdded.addListener(function(service) {
                if (service.uuid === SCALE_SERVICE_UUID) {
                    chrome.bluetoothLowEnergy.startCharacteristicNotifications(
                        self.deviceAddress + '/' + SCALE_CHARACTERISTIC_UUID,
                        function () {
                            if (chrome.runtime.lastError) {
                                console.log(
                                    'Failed to enable notifications: ' +
                                        chrome.runtime.lastError.message);
                                return;
                            }

                            console.log('Scale notifications enabled!');
                            self.initialized = true;
                            self.ready();
                        });

                    document.getElementById('device-status').innerHTML += ' ' + service.uuid;
                }
            });
            chrome.bluetoothLowEnergy.connect(device.address, function () {
                if (chrome.runtime.lastError) {
                    console.log('Failed to connect: ' + chrome.runtime.lastError.message);
                    return;
                }

                document.getElementById('device-status').innerHTML += ' c';
            });
        }

        chrome.bluetooth.onAdapterStateChanged.addListener(updateAdapterState);
        chrome.bluetooth.onDeviceAdded.addListener(deviceAdded);

        // Set up discovery toggle button handler
        UI.getInstance().setDiscoveryToggleHandler(function() {
            var discoveryHandler = function() {
                if (chrome.runtime.lastError) {
                    console.log('Failed to ' + (self.discovering_ ? 'stop' : 'start') + ' discovery ' +
                                chromium.runtime.lastError.message);
                }
            };
            if (self.discovering_) {
                chrome.bluetooth.stopDiscovery(discoveryHandler);
            } else {
                chrome.bluetooth.startDiscovery(discoveryHandler);
            }
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
