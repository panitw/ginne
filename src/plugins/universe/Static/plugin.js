'use strict';

class StaticUniverse {

    constructor (config) {
    }

    init () {
    }

    getUniverse (universeName) {
        if (Array.isArray(universeName)) {
            return universeName;
        } else {
            return require('./' + universeName);
        }
    }

}

module.exports = StaticUniverse;