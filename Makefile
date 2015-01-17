# if you invoke make as 'make V=1' it will verbosely list what it is
# doing, otherwise it defaults to pretty mode, which makes build
# errors _much_ easier to see
ifneq ($V, 1)
MAKEFLAGS = -s
endif

all: check dist

dist: node_modules www/bower_components
	grunt vulcanize

www/bower_components:
	bower install
	touch $@

node_modules: package.json
	npm install
	touch $@

node_modules/.bin/r.js: node_modules www/bower_components
	touch $@

hint:
	node_modules/.bin/jshint --config .jshintrc lib/*.js

clean:
	rm -rf dist

run-ios: check dist
	cca run ios --devicereset

run-android: check dist
#	mkdir -p ./platforms/android/src/org/chromium
	rsync -av ./plugins/org.chromium.bluetooth/src/android/ ./platforms/android/src/org/chromium
	rsync -av ./plugins/org.chromium.bluetoothLowEnergy/src/android/ ./platforms/android/src/org/chromium
	cca run android --device

check: node_modules www/bower_components
#	node_modules/.bin/nodeunit test/runner.js

.PHONY: all www hint jsdeps clean check run-ios run-android
