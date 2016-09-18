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
		plugin.addData('A', {d: new Date('2016-1-7'), o: 4});
		plugin.addData('A', {d: new Date('2016-1-2'), o: 1});
		plugin.addData('A', {d: new Date('2016-1-5'), o: 3});
		plugin.addData('A', {d: new Date('2016-1-4'), o: 2});
	});

	it('getFirstData()', () => {
		return plugin.getFirstData('A')
			.then((data) => {
				assert.equalDate(data.d, new Date('2016-1-2'));
			});
	});

	it('getLastData()', () => {
		return plugin.getLastData('A')
			.then((data) => {
				assert.equalDate(data.d, new Date('2016-1-7'));
			});
	});

	it('getData() - left bound beyond data', () => {
		return plugin.getData('A', new Date('2016-1-1'), new Date('2016-1-7'))
			.then((data) => {
				assert.equal(data.length, 4);
				assert.equalDate(data[0].d, new Date('2016-1-2'));
				assert.equalDate(data[1].d, new Date('2016-1-4'));
				assert.equalDate(data[2].d, new Date('2016-1-5'));
				assert.equalDate(data[3].d, new Date('2016-1-7'));
			});
	});

	it('getData() - left bound at the left of data', () => {
		return plugin.getData('A', new Date('2016-1-2'), new Date('2016-1-7'))
			.then((data) => {
				assert.equal(data.length, 4);
				assert.equalDate(data[0].d, new Date('2016-1-2'));
				assert.equalDate(data[1].d, new Date('2016-1-4'));
				assert.equalDate(data[2].d, new Date('2016-1-5'));
				assert.equalDate(data[3].d, new Date('2016-1-7'));
			});
	});

	it('getData() - left bound at the right of data left bound but not an index', () => {
		return plugin.getData('A', new Date('2016-1-3'), new Date('2016-1-7'))
			.then((data) => {
				assert.equal(data.length, 3);
				assert.equalDate(data[0].d, new Date('2016-1-4'));
				assert.equalDate(data[1].d, new Date('2016-1-5'));
				assert.equalDate(data[2].d, new Date('2016-1-7'));
			});
	});

	it('getData() - left bound at the right of data left bound at an index', () => {
		return plugin.getData('A', new Date('2016-1-4'), new Date('2016-1-7'))
			.then((data) => {
				assert.equal(data.length, 3);
				assert.equalDate(data[0].d, new Date('2016-1-4'));
				assert.equalDate(data[1].d, new Date('2016-1-5'));
				assert.equalDate(data[2].d, new Date('2016-1-7'));
			});
	});

	it('getData() - right bound at the right of data right bound', () => {
		return plugin.getData('A', new Date('2016-1-2'), new Date('2016-1-8'))
			.then((data) => {
				assert.equal(data.length, 4);
				assert.equalDate(data[0].d, new Date('2016-1-2'));
				assert.equalDate(data[1].d, new Date('2016-1-4'));
				assert.equalDate(data[2].d, new Date('2016-1-5'));
				assert.equalDate(data[3].d, new Date('2016-1-7'));
			});
	});

	it('getData() - right bound at the data right bound', () => {
		return plugin.getData('A', new Date('2016-1-2'), new Date('2016-1-7'))
			.then((data) => {
				assert.equal(data.length, 4);
				assert.equalDate(data[0].d, new Date('2016-1-2'));
				assert.equalDate(data[1].d, new Date('2016-1-4'));
				assert.equalDate(data[2].d, new Date('2016-1-5'));
				assert.equalDate(data[3].d, new Date('2016-1-7'));
			});
	});

	it('getData() - right bound at the left of data right bound but not at the index', () => {
		return plugin.getData('A', new Date('2016-1-2'), new Date('2016-1-6'))
			.then((data) => {
				assert.equal(data.length, 3);
				assert.equalDate(data[0].d, new Date('2016-1-2'));
				assert.equalDate(data[1].d, new Date('2016-1-4'));
				assert.equalDate(data[2].d, new Date('2016-1-5'));
			});
	});

	it('getData() - right bound at the left of data right bound', () => {
		return plugin.getData('A', new Date('2016-1-2'), new Date('2016-1-5'))
			.then((data) => {
				assert.equal(data.length, 3);
				assert.equalDate(data[0].d, new Date('2016-1-2'));
				assert.equalDate(data[1].d, new Date('2016-1-4'));
				assert.equalDate(data[2].d, new Date('2016-1-5'));
			});
	});

	it('updateData() - update existing data', () => {
		return plugin.updateData('A', {d: new Date('2016-1-2'), o: 10})
			.then(() => {
				return plugin.getData('A', new Date('2016-1-1'), new Date('2016-1-10'))
					.then((data) => {
						assert.equal(data.length, 4);
						assert.equalDate(data[0].d, new Date('2016-1-2'));
						assert.equal(data[0].o, 10);
					});
			});
	});

	it('updateData() - update with new data', () => {
		return plugin.updateData('A', {d: new Date('2016-1-3'), o: 100})
			.then(() => {
				return plugin.getData('A', new Date('2016-1-1'), new Date('2016-1-10'))
					.then((data) => {
						assert.equal(data.length, 5);
						assert.equalDate(data[0].d, new Date('2016-1-2'));
						assert.equal(data[0].o, 1);
						assert.equalDate(data[1].d, new Date('2016-1-3'));
						assert.equal(data[1].o, 100);
					});
			});
	});
});