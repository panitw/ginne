'use strict';

const moment = require('moment');

class StaticCache {
	constructor(config) {
		this._config = config;
	}

	init() {
	}

	getFirstData(symbol) {
        return null;
	}

	getLastData(symbol) {
        return null;
	}

	addData(symbol, data) {
	}

	getData(symbol, start, end) {
        if (typeof end === 'number') {
            let leftDate = moment(start).add(-1 * end, 'day').toDate();
            let rightDate = start;
            return this._generateData(leftDate, rightDate);
        } else {
            return this._generateData(start, end);
        }
	}

    _generateData(startDate, endDate) {
        return new Promise((resolve, reject) => {
            let output = [];
            let runner = startDate;

            while (runner <= endDate) {
                let dayOfWeek = moment(runner).day();
                let dayOfYear = moment(runner).dayOfYear();
                if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                    output.push({
                        d: runner,
                        o: dayOfYear,
                        h: dayOfYear,
                        l: dayOfYear,
                        c: dayOfYear,
                        v: dayOfYear
                    });
                }
                runner = moment(runner).add(1, 'day').toDate();
            }

            setTimeout(function () {
                resolve(output);
            }, 0);
        })
    }

}

module.exports = StaticCache;