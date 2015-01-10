// Copyright 2011 Bobby Powers. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.
define(['../lib/packet'], function(packet) {
    'use strict';

    var suite = {};

    suite.encode = function(test) {
        test.ok(true, 'fuck');
        test.done();
    };

    return suite;
});
