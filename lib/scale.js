// Copyright 2015 Bobby Powers. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

define(['./constants', './event_target'], function(constants, event_target) {
    'use strict';

    var TARE_PACKET = [0xdf, 0x78, 0x7, 0xc, 0x3, 0x0, 0x2, 0x50, 0x50, 0xb1];

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

    Scale.prototype = new event_target.EventTarget();

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
            if (characteristics[i].uuid == constants.SCALE_CHARACTERISTIC_UUID) {
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

    return {
        Scale: Scale,
    };
});
