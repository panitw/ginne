'use strict';

const seti = require('./SETIndex');

class StaticUniverse {

    constructor (config) {
    }

    init () {
    }

    getUniverse (universeName) {
        if (universeName === 'SET') {
            return seti;
        } else {
            return [];
        }
    }

}

module.exports = StaticUniverse;