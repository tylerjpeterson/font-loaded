'use strict';

var EventEmitter = require('events').EventEmitter;

var kebab = require('lodash/kebabCase');
var timeout = require('timeout-raf');
var merge = require('lodash/merge');
var inherits = require('inherits');

/**
 * FontLoaded constructor creates and injects DOM element which is measured at an interval to determine if a font has loaded.
 * @class FontLoaded
 * @augments {EventEmitter}
 *
 * @classdesc
 * Emits an event when a custom font has loaded via @font-face.
 * Emits an error if the font does not load within the timeout option.
 * Checks the measurement element at an interval set via the delay option.
 * Optionally applies a kebab-cased version of the font name as a class to the <html> tag upon success. Upon failure, that class is prefixed with 'no-'. Both success and failure classes are written only if the writeClass option is true (default).
 * The initial font used to determine the size of the measured element can be set via the testFont option. The default initial font is "Courier New". The test font should be a system font that is a different size than the font being monitored. Typically using a monospace'd initial font when when measuring a non-monospace font is sufficient (and vice-versa).
 *
 * @param {string} font - Font name to monitor
 * @param {object} [options] - Instance instantiation object
 * @param {string} [options.testFont="Courier New"] - Initial (system-available, web-safe) font
 * @param {string} [options.delay=50] - Interval before re-checking availability of font
 * @param {string} [options.timeout=2000] - Maximum number of seconds before emitting 'error'
 * @param {string} [options.testString="ABCDEFGHIJKLMNOPQRSTUVWXYZ"] - String injected in element for measurement
 * @param {boolean} [options.writeClass=true] - Whether or not to write font class to html element
 */
function FontLoaded(font, options) {
	EventEmitter.call(this);

	this.options = merge({}, FontLoaded.DEFAULTS, options || {});
	this.font = font || null;

	if (!this.font) {
		return;
	}

	this.check = this.check.bind(this);
	this.element = this._initializeElement();
	this.fontClass = kebab(this.font);
	this.initialWidth = this.element.getBoundingClientRect().width;
	this.element.style.fontFamily = [this.font, this.options.testFont].join(', ');

	this.timeout = timeout(this.check, this.options.delay);
}

inherits(FontLoaded, EventEmitter);

FontLoaded.DEFAULTS = {
	testString: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
	testFont: 'Courier New',
	writeClass: true,
	timeout: 2000,
	delay: 50
};

module.exports = FontLoaded;

/**
 * Callback to capture when font fails to load
 * @return {null}
 */
FontLoaded.prototype.failure = function () {
	if (this.options.writeClass) {
		document.documentElement.classList.add('no-' + this.fontClass);
	}

	/* istanbul ignore else */
	if (this.element.parentNode) {
		this.element.parentNode.removeChild(this.element);
	}

	/**
     * Triggered when a font fails to load in given timeout
     * @event FontLoaded#error
     * @type {object}
     * @property {string} font - Name of font that failed to load
     */
	this.emit('error', this.font);

	this.destroy();
};

/**
 * Callback to capture when font loads
 * @return {null}
 */
FontLoaded.prototype.success = function () {
	if (this.options.writeClass) {
		document.documentElement.classList.add(this.fontClass);
	}

	/* istanbul ignore else */
	if (this.element.parentNode) {
		this.element.parentNode.removeChild(this.element);
	}

	/**
     * Triggered when a font loads successfully.
     * Aliased as the 'load' event.
     * @event FontLoaded#success
     * @type {object}
     * @property {string} font - Name of font that failed to load
     */
	this.emit('success', this.font);
	this.emit('load', this.font);

	this.destroy();
};

/**
 * Queue up another check if previous check was inconclusive
 * @return {null}
 */
FontLoaded.prototype.queue = function () {
	timeout(this.check, this.options.delay);

	this.options.timeout -= this.options.delay;
};

/**
 * Measure the injected element to see if / when the width changes (indicating the font loaded successfully)
 * @return {null}
 */
FontLoaded.prototype.check = function () {
	/* istanbul ignore if */
	if (!this.element) {
		return;
	}

	if (this.element.getBoundingClientRect().width !== this.initialWidth) {
		this.success();
		return;
	}

	if (this.options.timeout < 0) {
		this.failure();
		return;
	}

	this.queue();
};

/**
 * Remove the event listener, the measurement element, the DOM reference to it, and destroy the instance.
 * @return {null}
 */
FontLoaded.prototype.destroy = function () {
	/* istanbul ignore else */
	if (typeof this.timeout.kill === 'function') {
		this.timeout.kill();
	}

	/* istanbul ignore if */
	if (this.element.parentNode) {
		this.element.parentNode.removeChild(this.element);
	}

	this.element = null;

	EventEmitter.prototype.removeAllListeners.call(this);
};

/**
 * Creates DOM element that will be measured to determine whether the font has loaded.
 * It seems this element must actually be added to the DOM.
 * In-memory off-screen measurement produces inaccurate results in certain circumstances.
 * @private
 * @return {HTMLElement} Injected element to be measured.
 */
FontLoaded.prototype._initializeElement = function () {
	var element = document.createElement('span');

	element.textContent = this.options.testString;
	element.style.fontFamily = this.options.testFont;
	element.style.visibility = 'hidden';
	element.style.position = 'absolute';
	element.style.fontSize = '250px';
	element.style.left = '-9999px';
	element.style.top = '-9999px';

	document.body.appendChild(element);

	return element;
};
