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
            discoveryToggleButton.innerHTML = 'connected';
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

    UI.prototype.setDiscoveryToggleHandler = function(handler) {
        var discoveryToggleButton = document.getElementById('discovery-toggle-button');
        discoveryToggleButton.onclick = handler;
    };

    UI.prototype.setTareHandler = function(handler) {
        var tareButton = document.getElementById('tare-button');
        tareButton.onclick = handler;
    }

    UI.prototype.setWeightDisplay = function(value) {
        var weightDisplay = document.getElementById('weight-display');

        weightDisplay.innerHTML = '' + value;
    };

    UI.prototype.setAdapterState = function(address, name) {
        var addressField = document.getElementById('adapter-address');
        var nameField = document.getElementById('adapter-name');

        var setAdapterField = function (field, value) {
            field.innerHTML = '';
            field.appendChild(document.createTextNode(value));
        };

        setAdapterField(addressField, address ? address : 'unknown');
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
