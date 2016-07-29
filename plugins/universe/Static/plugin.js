'use strict';

const set = require('./SET');
const set50 = require('./SET50');

class StaticUniverse {

    constructor (config) {
    }

    init () {
    }

    getUniverse (universeName) {
        if (Array.isArray(universeName)) {
            return universeName;
        } else
        if (universeName === 'SET') {
            return set;
        } else 
        if (universeName === 'SET50') {
            return set50;
        } else{
            return [];
        }
    }

}

module.exports = StaticUniverse;