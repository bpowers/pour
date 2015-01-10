// Copyright 2015 Bobby Powers. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

define(['./constants', './event_target', './scale'], function(constants, event_target, scale) {
    'use strict';

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

    ScaleFinder.prototype = new event_target.EventTarget();

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

    return {
        ScaleFinder: ScaleFinder,
    };
});
