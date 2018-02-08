# FontLoaded
> Emitter that fires an event when a custom font has loaded (or not).

Emits an event when a custom font has loaded via `@font-face`.
Emits an error if the font does not load within the timeout option.
Determines load status by injecting an element with content set to a system font, and measures the element, emitting the load event when dimensions change.

Optionally applies a kebab-cased version of the font name as a class to the `<html>` tag upon success. 
Upon failure, that class is prefixed with 'no-'. 
Both success and failure classes are written only if the writeClass option is true (default).

The initial font used to determine the size of the measured element can be set via the testFont option. 
The default initial font is "Courier New". 
The test font should be a system font that is a different size than the font being monitored. 
Typically using a monospace'd initial font when when measuring a non-monospace font is sufficient (and vice-versa).


## Installation
Install via npm.

```sh
$ npm i font-loaded
```


## Usage
Require and subscribe.

```javascript
var FontLoaded = require('font-loaded');
var fontLoaded = new FontLoaded('Name of Font');

// You can also subscribe to the "success" event (alias)
fontLoaded.on('load', fontName => {
  console.log(`${fontName} loaded.`);
});

fontLoaded.on('error', fontName => {
  console.log(`${fontName} did not load.`);
});
```


### Options
Options are passed at instantiation.

- `font {string}` - Font name to monitor
- `[options={}] {object}` - Instance instantiation object
- `[options.testFont="Courier New"] {string}` - Initial (system-available, web-safe) font
- `[options.delay=50] {string}` - Interval before re-checking availability of font
- `[options.timeout=2000] {string}` - Maximum number of seconds before emitting 'error'
- `[options.testString="ABCDEFGHIJKLMNOPQRSTUVWXYZ"] {string}` - Text content of measurement element
- `[options.writeClass=true] {boolean}` - Whether or not to write a font class to `<html>` element


## Known Issues
- The tests are very sloppy, and should be considered "in progress"
