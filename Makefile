# if you invoke make as 'make V=1' it will verbosely list what it is
# doing, otherwise it defaults to pretty mode, which makes build
# errors _much_ easier to see
ifneq ($V, 1)
MAKEFLAGS = -s
endif

all: dist check

dist: dist/pour.js dist/pour.min.js

bower_components:
	bower install
	touch $@

node_modules: package.json
	npm install
	touch $@

node_modules/.bin/r.js: node_modules bower_components
	touch $@

dist/pour.js: node_modules/.bin/r.js build.js lib/*.js
	mkdir -p dist
	node_modules/.bin/r.js -o build.js

dist/pour.min.js: node_modules/.bin/r.js build_min.js lib/*.js
	mkdir -p dist
	node_modules/.bin/r.js -o build_min.js

hint:
	node_modules/.bin/jshint --config .jshintrc lib/*.js

clean:
	rm -rf dist

run-ios:
	cca run ios --devicereset

run-android:
	cca run android --device

check: node_modules bower_components
	node_modules/.bin/nodeunit test/runner.js

.PHONY: all dist hint jsdeps clean check run-ios run-android
