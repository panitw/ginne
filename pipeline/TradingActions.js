'use strict';

class TradingActions {

    constructor () {
        this.handlers = {};
    }

    handlers (eventName) {
        return this.handles[eventName];
    }

    on (eventName, handler) {
        if (!this.handlers[eventName]) {
            this.handlers[eventName] = [];
        }
        this.handlers[eventName].push(handler);
    }

}

module.exports = TradingActions;