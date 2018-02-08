'use strict';

const test = require('tape');
const Loader = require('./../../');

document.body.innerHTML = '<!doctype html><html><head><meta charset="utf-8"><title>FontloadEmitter</title><link rel="stylesheet" href="../examples/css/main.css"><link href="https://fonts.googleapis.com/css?family=Shadows+Into+Light" rel="stylesheet"></head><body><h1>FontloadEmitter</h1></body></html>';

const silentBadLoader = new Loader('Silent Fake Font', {timeout: 1000, writeClass: false});
const silentLoader = new Loader('Menlo', {timeout: 1000, writeClass: false});
const goodLoader = new Loader('Shadows Into Light', {timeout: 1000});
const noFont = new Loader(null, {timeout: 1000, writeClass: false});
const badLoader = new Loader('Fake font', {timeout: 1000});
const defaultFont = new Loader('helvetica');

test('Emit accurate statuses', t => {
	t.plan(4);

	goodLoader.on('success', () => {
		t.pass('Good font loaded successfully.');
	});

	badLoader.on('success', () => {
		t.fail('Bad font loaded successfully.');
	});

	goodLoader.on('error', () => {
		t.fail('Good font failed to load.');
	});

	badLoader.on('error', () => {
		t.pass('Bad font failed to load.');
	});

	silentBadLoader.on('error', () => {
		t.pass('Silent bad font failed to load.');
	});

	noFont.on('success', () => {
		t.fail('No font loaded.');
	});

	defaultFont.on('success', () => {
		t.pass('Default font loaded successfully.');
	});

	setTimeout(() => {
		t.end();
	}, 2100);
});

test('Assigns classnames properly', t => {
	t.plan(3);

	setTimeout(() => {
		t.ok(document.documentElement.classList.contains('shadows-into-light'), 'Adds classname for loaded fonts');
		t.ok(document.documentElement.classList.contains('helvetica'), 'Removes classname for failed fonts');
		t.ok(!document.documentElement.classList.contains('fake-font'), 'Removes classname for failed fonts');
	}, 1000);
});

test('Ignores classnames properly', t => {
	t.plan(2);

	setTimeout(() => {
		t.ok(!document.documentElement.classList.contains('menlo'), 'Ignores classname for loaded fonts');
		t.ok(!document.documentElement.classList.contains('silent-fake-font'), 'Ignores classname for failed fonts');
	}, 1000);
});

setTimeout(() => {
	window.close();
}, 4200);
