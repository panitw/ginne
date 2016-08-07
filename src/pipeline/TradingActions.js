'use strict';

class TradingActions {

    constructor () {
        this._handlers = {};
    }

    handlers (eventName) {
        return this._handlers[eventName];
    }

    on (eventName, handler) {
        if (!this._handlers[eventName]) {
            this._handlers[eventName] = [];
        }
        this._handlers[eventName].push(handler);
    }

}

module.exports = TradingActions;