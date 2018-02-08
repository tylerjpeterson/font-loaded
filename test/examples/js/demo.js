'use strict';

var FontloadEmitter = require('./../../../');

var fontloadEmitter = new FontloadEmitter('Shadows Into Light');

fontloadEmitter.on('success', function () {
	console.log('done');
});

fontloadEmitter.on('error', function () {
	console.log('failed');
});
