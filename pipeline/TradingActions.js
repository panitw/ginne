'use strict';

class TradingActions {

    constructor () {
        this.handlers = {};
    }

    on (eventName, handler) {
        if (!this.handler[eventName]) {
            this.handler[eventName] = [];
        }
        this.handler[eventName].push(handler);
    }

}

module.exports = TradingActions;