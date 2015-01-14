var UI = (function() {

    // Common functions used for tweaking UI elements.
    function UI() {
    }

    // Global instance.
    var instance;

    UI.prototype.setDiscoveryToggleState = function(isDiscoverying, haveScale) {
        var discoveryToggleButton = document.getElementById('discovery-toggle-button');
        if (isDiscoverying) {
            discoveryToggleButton.innerHTML = 'cancel';
        } else if (haveScale) {
            discoveryToggleButton.innerHTML = 'disconnect';
        } else {
            discoveryToggleButton.innerHTML = 'connect';
        }
    };

    UI.prototype.setDiscoveryToggleEnabled = function(isEnabled) {
        var discoveryToggleButton = document.getElementById('discovery-toggle-button');
        discoveryToggleButton.disabled = !isEnabled;
    };

    UI.prototype.setStatus = function(content) {
        var statusElement = document.getElementById('status');
        statusElement.innerHTML = content;
    };

    UI.prototype.setTareEnabled = function(isEnabled) {
        var tareButton = document.getElementById('tare-button');
        tareButton.disabled = !isEnabled;
    };

    UI.prototype.setRecordState = function(status) {
        var recordElement = document.getElementById('record-button');
        recordElement.innerHTML = status;
    };

    UI.prototype.setRecordEnabled = function(isEnabled) {
        var recordElement = document.getElementById('record-button');
        recordElement.disabled = !isEnabled;
    };

    UI.prototype.setDiscoveryToggleHandler = function(handler) {
        var discoveryToggleButton = document.getElementById('discovery-toggle-button');
        discoveryToggleButton.onclick = handler;
    };

    UI.prototype.setTareHandler = function(handler) {
        var tareButton = document.getElementById('tare-button');
        tareButton.onclick = handler;
    };

    UI.prototype.setRecordHandler = function(handler) {
        var recordButton = document.getElementById('record-button');
        recordButton.onclick = handler;
    };

    UI.prototype.setWeightDisplay = function(value) {
        var weightDisplay = document.getElementById('weight-display');

        weightDisplay.innerHTML = '' + value;
    };

    UI.prototype.setBatteryLevel = function(value) {
        var batteryDisplay = document.getElementById('battery-display');

        batteryDisplay.innerHTML = '' + (value*100) + '%';
    };

    UI.prototype.setAdapterState = function(address, name) {
        var nameField = document.getElementById('adapter-name');

        var setAdapterField = function (field, value) {
            field.innerHTML = '';
            field.appendChild(document.createTextNode(value));
        };

        setAdapterField(nameField, name ? name : 'Local Adapter');
    };

    return {
        getInstance: function() {
            if (!instance) {
                instance = new UI();
            }

            return instance;
        }
    };
})();
