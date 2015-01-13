// Copyright 2015 Bobby Powers. All rights reserved.
// Use of this source code is governed by the MIT
// license that can be found in the LICENSE file.

define(['./scale_finder'], function(scale_finder) {
    'use strict';

    AWS.config.credentials = new AWS.Credentials({
        'accessKeyId': 'AKIAJ67FAJ6OJKPQRYAA',
        'secretAccessKey': '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',
    });
    AWS.config.region = 'us-east-1';

    var bucket = new AWS.S3({params: {Bucket: 'pour-app'}});

    function App() {
        try {
            this.finder = new scale_finder.ScaleFinder();
            this.finder.addEventListener('ready',
                                         this.finderReady.bind(this));
            this.finder.addEventListener('discoveryStateChanged',
                                         this.updateDiscoveryToggleState.bind(this));
            this.finder.addEventListener('scaleAdded',
                                         this.scaleAdded.bind(this));
        } catch (e) {
            console.log('finder failed: ' + e);
            this.finder = null;
        }

        this.listRecordings();
    }

    App.prototype.finderReady = function() {
        var addr = this.finder.adapterState.address;
        var name = this.finder.adapterState.name;
        UI.getInstance().setAdapterState(addr, name);
        UI.getInstance().setDiscoveryToggleEnabled(true);
    };

    App.prototype.updateDiscoveryToggleState = function(event) {
        UI.getInstance().setDiscoveryToggleState(event.detail.discovering, !!this.scale);
    };

    App.prototype.weightChanged = function(event) {
        var value = event.detail.value;

        UI.getInstance().setWeightDisplay(value);
    };

    App.prototype.scaleAdded = function(event) {
        this.finder.stopDiscovery();

        this.scale = event.detail.scale;
        this.scale.addEventListener('weightChanged',
                                    this.weightChanged.bind(this));

        UI.getInstance().setDiscoveryToggleEnabled(false);
        UI.getInstance().setTareEnabled(true);
        UI.getInstance().setRecordEnabled(true);
    };

    App.prototype.postData = function(series) {
        var name = this.finder.adapterState.name;
        name = name.replace(/ /g, '_').replace(/'/g, '');

        var key = name + '.' + Date.now() + '.json';
        var body = JSON.stringify(series);

        bucket.upload({Key: key, Body: body}, function (err, data) {
            if (err)
                UI.getInstance().setStatus('failed uploading to s3');
            else
                UI.getInstance().setStatus('uploaded data to s3');

            console.log('data:');
            console.log(data);
        });
    };

    App.prototype.listRecordings = function() {
        bucket.listObjects(function (err, data) {
            if (err)
                UI.getInstance().setStatus('Could not load objects from S3');
            else
                UI.getInstance().setStatus('Loaded ' + data.Contents.length + ' items from S3');
            console.log(err);
            console.log(data);
        });
    };

    App.prototype.init = function() {
        UI.getInstance().setDiscoveryToggleHandler(function() {
            if (!this.discovering)
                this.finder.startDiscovery();
            else
                this.finder.stopDiscovery();
        }.bind(this));

        UI.getInstance().setTareHandler(function() {
            if (!this.scale) {
                console.log('ERROR: tare without scale.');
                return;
            }
            this.scale.tare();
        }.bind(this));

        UI.getInstance().setRecordHandler(function() {
            if (!this.scale) {
                console.log('ERROR: record without scale.');
                return;
            }
            if (this.scale.recorder) {
                var series = this.scale.stopRecording();
                this.postData(series);
                UI.getInstance().setRecordState('record');
            } else {
                this.scale.startRecording();
                UI.getInstance().setRecordState('stop');
            }
        }.bind(this));
    };

    return {
        App: App,
    };
});
