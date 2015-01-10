// Copyright 2015 Bobby Powers. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

define(['../lib/packet'], function(packet) {
    'use strict';

    var TARE_PACKET = [0xdf, 0x78, 0x7, 0xc, 0x3, 0x0, 0x2, 0x50, 0x50, 0xb1];
    
    var suite = {};

    var contentsEqual = function(test, msg, ref) {
        var ok = true;
        for (var i = 0; i < msg.byteLength; i++) {
            ok &= msg[i] === ref[i];
            test.ok(msg[i] === ref[i], 'position ' + i + ' matches');
        }
        return ok;
    };

    suite.encode = function(test) {
        var sequenceId = TARE_PACKET[4];

        packet.setSequenceId(sequenceId);

        var encodedMsg = packet.encodeTare();

        test.ok(encodedMsg, 'no encoded message returned');
        test.ok(encodedMsg.byteLength === TARE_PACKET.length, 'bad length');

        test.ok(contentsEqual(test, encodedMsg, TARE_PACKET), 'contents match');

        test.done();
    };

    return suite;
});
