var UI = (function() {

    // Common functions used for tweaking UI elements.
    function UI() {
    }

    // Global instance.
    var instance;

    UI.prototype.setDiscoveryToggleState = function(isDiscoverying) {
        var discoveryToggleButton = document.getElementById('discovery-toggle-button');
        if (isDiscoverying) {
            discoveryToggleButton.innerHTML = 'cancel';
        } else {
            discoveryToggleButton.innerHTML = 'connect';
        }
    };

    UI.prototype.setDiscoveryToggleHandler = function(handler) {
        var discoveryToggleButton = document.getElementById('discovery-toggle-button');
        discoveryToggleButton.onclick = handler;
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
