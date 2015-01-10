// Copyright 2015 Bobby Powers. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

define(['./constants'], function(constants) {
    'use strict';

    var TARE_PACKET = [0xdf, 0x78, 0x7, 0xc, 0x3, 0x0, 0x2, 0x50, 0x50, 0xb1];

    // unsigned char packet sequence id.
    var sequenceId = 0;
    
    var nextSequenceId = function() {
        var next = sequenceId++;
        sequenceId &= 0xff;
    };

    var getSequenceId = function() {
        return sequenceId;
    };

    function Message(type, id, payload) {
        this.type = type;
        this.id = id;
        this.payload = payload;
        this.value = -1;
        if (this.type === constants.MessageType.WEIGHT_RESPONSE) {
            var value = ((payload[1] & 0xff) << 8) + (payload[0] & 0xff);
            for (var i = 0; i < payload[4]; i++)
                value /= 10;
            if ((payload[6] & 0x02) == 0x02)
                value *= -1;
            this.value = value;
        }
    }

    var checksum = function(data) {
        var sum;

        for (var i = 0; i < data.length; i++)
            sum += data[i];

        return sum & 0xff;
    };

    var payloadEncode = function() {

    };

    var encode = function(msg, id, payload) {

    };

    var decode = function(data) {

    };

    var msgType = function() {

    };

    var encodeTare = function() {
        var buf = new ArrayBuffer(16);
        var bytes = new Uint8Array(buf);

        for (var i = 0; i < TARE_PACKET.length; i++)
            bytes[i] = TARE_PACKET[i] & 0xff;

        return buf;
    }

    return {
        encodeTare: encodeTare,
        decode: decode,
        getSequenceId: getSequenceId,
    };
});

