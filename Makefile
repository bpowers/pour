

all:

run-ios:
	cca run ios --devicereset

run-android:
	rsync -av ./plugins/org.chromium.bluetooth/src/android/ ./platforms/android/src/org/chromium
	cca run android --device

.PHONY: run-ios run-android
