var main = (function() {
    var SCALE_UUID = '00001820-0000-1000-8000-00805f9b34fb';

    function PourApp() {
        // A mapping from device addresses to device.
        this.deviceMap_ = {};

        // The currently selected service and its characteristics.
        this.service_ = null;
        this.chrcMap_ = {};
        this.discovering_ = false;
    }

    PourApp.prototype.updateDiscoveryToggleState = function(discovering) {
        if (this.discovering_ !== discovering) {
            this.discovering_ = discovering;
            UI.getInstance().setDiscoveryToggleState(this.discovering_);
        }
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
            if (!device.uuids || device.uuids.indexOf(SCALE_UUID) < 0)
                return;

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
            chrome.bluetoothLowEnergy.connect(device.address, function () {
                if (chrome.runtime.lastError) {
                    console.log('Failed to connect: ' + chrome.runtime.lastError.message);
                    return;
                }

                document.getElementById('device-status').innerHTML += ' CONNECTED';
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

        // Track GATT services as they are added.
        chrome.bluetoothLowEnergy.onServiceAdded.addListener(function (service) {
            console.log('GOT SERVICE');
            console.log(service);
            // Ignore, if the service is not a Device Information service.
            if (service.uuid != DEVICE_INFO_SERVICE_UUID)
                return;

            // Add the device of the service to the device map and update the UI.
            console.log('New Device Information service added: ' + service.instanceId);
            if (isKnownDevice(service.deviceAddress))
                return;

            // Looks like it's a brand new device. Get information about the device so
            // that we can display the device name in the drop-down menu.
            chrome.bluetooth.getDevice(service.deviceAddress, function (device) {
                if (chrome.runtime.lastError) {
                    console.log(chrome.runtime.lastError.message);
                    return;
                }

                storeDevice(device.address, device);
            });
        });

        // Track GATT services as they change.
        chrome.bluetoothLowEnergy.onServiceChanged.addListener(function (service) {
            // This only matters if the selected service changed.
            if (!self.service_ || service.instanceId != self.service_.instanceId)
                return;

            console.log('The selected service has changed');

            // Reselect the service to force an updated.
            self.selectService(service);
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
