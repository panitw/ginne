'use strict';

const bs = require('binarysearch');

class MemoryCache {

	constructor(config) {
		this._config = config;
	}

	init() {
		this._cache = {};
		return Promise.resolve();
	}

	getFirstData(symbol) {
		if (this._cache[symbol] && this._cache[symbol].length > 0) {
			return Promise.resolve(this._cache[symbol][0]);
		} else {
			return Promise.resolve(null);
		}
	}

	getLastData(symbol) {
		if (this._cache[symbol] && this._cache[symbol].length > 0) {
			let length = this._cache[symbol].length;
			return Promise.resolve(this._cache[symbol][length - 1]);
		} else {
			return Promise.resolve(null);
		}
	}

	getData(symbol, start, end) {
		let leftIndex = this._findIndex(symbol, start);
		let rightIndex = this._findIndex(symbol, end);
		if (leftIndex !== -1 && rightIndex !== -1) {
			let leftItem = this._getDataAtIndex(symbol, leftIndex);
			if (leftItem.d.getTime() < start.getTime()) {
				leftIndex++;
				leftItem = this._getDataAtIndex(symbol, leftIndex);
				if (!leftItem) {
					return Promise.resolve([]);
				}
			}
			rightIndex++;
			return Promise.resolve(this._cache[symbol].slice(leftIndex, rightIndex));
		} else {
			return Promise.resolve([]);
		}
	}

	addData(symbol, data) {
		if (!Array.isArray(data)) {
			data = [data];
		}
		let cache = this._cache[symbol];
		if (cache) {
			for (let i=0; i<data.length; i++) {
				bs.insert(cache, data[i], {unique: true}, this._comparer);
			}
		} else {
			data.sort(this._comparer);
			this._cache[symbol] = data;
		}
		return Promise.resolve();
	}

	updateData (symbol, data) {
		return this.addData(symbol, data);
	}

	_getDataAtIndex (symbol, index) {
		let data = this._cache[symbol];
		if (data) {
			return data[index];
		} else {
			return null;
		}
	}

	_findIndex (symbol, date, exact) {
		let data = this._cache[symbol];
		if (data) {
			if (!exact) {
				return bs.closest(data, {d: date}, this._comparer);
			} else {
				return bs(data, {d: date}, this._comparer);
			}
		} else {
			return -1;
		}
	}

	_comparer (value, find) {
		if (value.d > find.d) {
			return 1;
		} else
		if(value.d < find.d) {
			return -1;
		}
		return 0;
	}
}

module.exports = MemoryCache;