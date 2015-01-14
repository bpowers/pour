// Copyright 2015 Bobby Powers. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

define(['./constants'], function(constants) {
    'use strict';

    // TODO(bp) this is a guess
    var MAX_PAYLOAD_LENGTH = 10;

    var MessageType = constants.MessageType;
    var MAGIC1 = constants.MAGIC1;
    var MAGIC2 = constants.MAGIC2;

    // packet sequence id in the range of 0-255 (unsigned char)
    var sequenceId = 0;
    
    var nextSequenceId = function() {
        var next = sequenceId++;
        sequenceId &= 0xff;

        return next;
    };

    var setSequenceId = function(id) {
        sequenceId = id & 0xff;
    };

    var getSequenceId = function() {
        return sequenceId;
    };

    function Message(type, id, payload) {
        this.type = type;
        this.id = id;
        this.payload = payload;
        this.value = null;
        if (this.type === MessageType.WEIGHT_RESPONSE) {
            var value = ((payload[1] & 0xff) << 8) + (payload[0] & 0xff);
            for (var i = 0; i < payload[4]; i++)
                value /= 10;
            if ((payload[6] & 0x02) == 0x02)
                value *= -1;
            this.value = value;
        }
    }

    var encipher = function(out, input, sequenceId) {
        for (var i = 0; i < out.byteLength; i++) {
            var offset = (input[i] + sequenceId) & 0xff;
            out[i] = constants.TABLE1[offset];
        }
    };

    var decipher = function(input, sequenceId) {
        var result = new Array(input.byteLength);

        for (var i = 0; i < input.byteLength; i++) {
            var offset = input[i] & 0xff;
            result[i] = (constants.TABLE2[offset] - sequenceId) & 0xff;
        }

        return result;
    };

    var checksum = function(data) {
        var sum = 0;

        for (var i = 0; i < data.length; i++)
            sum += data[i];

        return sum & 0xff;
    };

    var encode = function(msgType, id, payload) {
        if (payload.length > MAX_PAYLOAD_LENGTH)
            throw 'payload too long: ' + payload.length;

        var buf = new ArrayBuffer(8 + payload.length);
        var bytes = new Uint8Array(buf);

        var sequenceId = nextSequenceId();

        bytes[0] = MAGIC1;
        bytes[1] = MAGIC2;
        bytes[2] = 5 + payload.length;
        bytes[3] = msgType;
        bytes[4] = sequenceId;
        bytes[5] = id;
        bytes[6] = payload.length & 0xff;

        var payloadOut = new Uint8Array(buf, 7, payload.length);

        encipher(payloadOut, payload, sequenceId);

        var contentsToChecksum = new Uint8Array(buf, 3, payload.length + 4);

        bytes[7 + payload.length] = checksum(contentsToChecksum);

        return buf;
    };

    var decode = function(data) {
        var len = data.length;
        if (!len)
            len = data.byteLength;
        if (!len)
            return;

        var bytes = new Uint8Array(data);

        if (len < 8)
            throw 'data too short: ' + len;

        if (bytes[0] !== MAGIC1 && bytes[1] !== MAGIC2)
            throw "don't have the magic";

        var len1 = bytes[2];

        var contentsToChecksum = new Uint8Array(data.slice(3, len - 1));

        var cs = checksum(contentsToChecksum);
        if (bytes[len - 1] !== cs)
            throw 'checksum mismatch ' + bytes[len - 1] + ' !== ' + cs;

        var msgType = bytes[3];
        var sequenceId = bytes[4];
        var id = bytes[5];
        var len2 = bytes[6];

        if (len1 !== len - 3)
            throw 'length mismatch 1 ' + len1 + ' !== ' + (len - 3);
        if (len2 !== len - 8)
            throw 'length mismatch 2';

        var payloadIn = new Uint8Array(data.slice(7, len - 1));
        var payload = decipher(payloadIn, sequenceId);

        return new Message(msgType, id, payload);
    };

    var encodeWeight = function(period, time, type) {
        if (!period)
            period = 1;
        if (!time)
            time = 100;
        if (!type)
            type = 1;

        var payload = [period & 0xff, time & 0xff, type & 0xff];

        return encode(MessageType.WEIGHT, 0, payload);
    };

    var encodeTare = function() {
        var payload = [0x0, 0x0];

        return encode(MessageType.CUSTOM, 0, payload);
    };

    var encodeStartTimer = function() {
        var payload = [0x5];

        return encode(MessageType.CUSTOM, 0, payload);
    };

    var encodePauseTimer = function() {
        var payload = [0x6];

        return encode(MessageType.CUSTOM, 0, payload);
    };

    var encodeStopTimer = function() {
        var payload = [0x7];

        return encode(MessageType.CUSTOM, 0, payload);
    };

    return {
        encodeTare: encodeTare,
        encodeWeight: encodeWeight,
        encodeStartTimer: encodeStartTimer,
        encodePauseTimer: encodePauseTimer,
        encodeStopTimer: encodeStopTimer,
        decode: decode,
        setSequenceId: setSequenceId,
        getSequenceId: getSequenceId,
    };
});
