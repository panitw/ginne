'use strict';

var chai = require('chai');
var assert = chai.assert;
var Plugin = require('../../../../src/plugins/cache/Memory/plugin');

chai.use(require('chai-datetime'));

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

	it('getData() - left bound beyond data', () => {
		return plugin.getData('A', new Date('2016-1-1'), new Date('2016-1-5'))
			.then((data) => {
				assert.equal(data.length, 4);
				assert.equalDate(data[0].d, new Date('2016-1-2'));
				assert.equalDate(data[1].d, new Date('2016-1-3'));
				assert.equalDate(data[2].d, new Date('2016-1-4'));
				assert.equalDate(data[3].d, new Date('2016-1-5'));
			});
	});

	it('getData() - left bound at the left of data', () => {
		return plugin.getData('A', new Date('2016-1-2'), new Date('2016-1-5'))
			.then((data) => {
				assert.equal(data.length, 4);
				assert.equalDate(data[0].d, new Date('2016-1-2'));
				assert.equalDate(data[1].d, new Date('2016-1-3'));
				assert.equalDate(data[2].d, new Date('2016-1-4'));
				assert.equalDate(data[3].d, new Date('2016-1-5'));
			});
	});

	it('getData() - left bound at the right of data left bound', () => {
		return plugin.getData('A', new Date('2016-1-3'), new Date('2016-1-5'))
			.then((data) => {
				assert.equal(data.length, 3);
				assert.equalDate(data[0].d, new Date('2016-1-3'));
				assert.equalDate(data[1].d, new Date('2016-1-4'));
				assert.equalDate(data[2].d, new Date('2016-1-5'));
			});
	});
});