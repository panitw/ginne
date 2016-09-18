'use strict';

var assert = require('chai').assert;
var Plugin = require('../../../../src/plugins/cache/Memory/plugin');

describe('cache plugin - Memory', () => {

	let plugin = null;

	beforeEach(() => {
		plugin = new Plugin();
		plugin.init();
		plugin.addData('A', {d: new Date('2016-1-2'), o: 1});
		plugin.addData('A', {d: new Date('2016-1-3'), o: 2});
		plugin.addData('A', {d: new Date('2016-1-4'), o: 3});
		plugin.addData('A', {d: new Date('2016-1-5'), o: 4});
	});

	it('addData()', (done) => {
		plugin.getData('A', new Date('2016-1-1'), new Date('2016-1-5'))
			.then((data) => {
				assert.equal(data.length, 4);
				done();
			});
	});

});