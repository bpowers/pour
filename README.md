pour
====

works on android + iOS.


building for iOS
----------------

Make sure you have Apple's developer tools installed, and your iOS
device setup for development.

Install `cca`, the commandline tool to package up mobile chrome apps.
Should be able to do:

```
$ npm install -g cca
$ cca checkdev
```

Ignore any warnings or popups about Java.  See
[here](https://github.com/MobileChromeApps/mobile-chrome-apps/blob/master/docs/Installation.md#install-the-cca-command-line-tool)
for more details if the above doesn't immediately work.

Then simply from the root of this project:

```
$ make run-ios
```

That should spew a bunch of stuff, and put the app on your device.


Data
----

Data is logged to https://pour-app.s3.amazonaws.com/ for all scales.
There are credentials
[here](https://github.com/bpowers/pour/blob/master/lib/app.js#L8) to
post new data and use Amazon's s3 javascript + python libraries
(bucket name is pour-app).

Basically, if you can get the app running on an iOS device, you should
be able to hit connect, have it find your scale, tare the thing, hit
`record`, do a pourover, hit `stop`, and it will upload the data to
s3.


TODO
----

immediately:

- ~~port packet encoding code to Javascript~~ (DONE)
- ~~implement startCharacteristicNotifications for Android~~ (DONE)
- ~~hook up onCharacteristicValueChanged for Android~~ (DONE)
- ~~implement weight command to get scale to stream readings back to app~~ (DONE)

at that point, things become more useful.  we'll have an app that can
read values + tare the scale.

- ~~implement start + stop button~~ (DONE)
- ~~on start, record incoming weights (8-10 samples per second)~~ (DONE)
- ~~on stop, log/post the data somewhere~~ (DONE, s3)
- and look into visualizations
- figure out the UI for managing & comparing different pours
- so much that could be done to visualize + explore the data

I'm interested in doing some UI work:

- use polymer for the app
- implement a flow for doing a pourover (mockups forthcoming)
- create & manage known drippers
- create & manage current bags of coffee

Probably also want to look into signing into the app with a google
account to simplify access to google spreadsheets.
