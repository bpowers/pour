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


TODO
----

immediately:

- port packet encoding code to Javascript
- implement startCharacteristicNotifications for Android
- hook up onCharacteristicValueChanged for Android
- implement weight command to get scale to stream readings back to app

at that point, things become more useful.  we'll have an app that can
read values + tare the scale.

- implement start + stop button
- on start, record incoming weights (8-10 samples per second)
- on stop, log/post the data somewhere, and look into visualizations
- figure out the UI for managing & comparing different pours
- so much that could be done to visualize + explore the data

I'm interested in doing some UI work:

- use polymer for the app
- implement a flow for doing a pourover (mockups forthcoming)
- create & manage known drippers
- create & manage current bags of coffee

Probably also want to look into signing into the app with a google
account to simplify access to google spreadsheets.
