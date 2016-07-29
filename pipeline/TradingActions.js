'use strict';

class TradingActions {

    constructor () {
        this.handlers = {};
    }

    on (eventName, handler) {
        if (!this.handlers[eventName]) {
            this.handlers[eventName] = [];
        }
        this.handlers[eventName].push(handler);
    }

}

module.exports = TradingActions;