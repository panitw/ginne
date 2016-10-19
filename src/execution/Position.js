'use strict';

class Position {

    constructor (symbol, numberOfPositions, price, commission) {
        this._symbol = symbol;
        this._numberOfPositions = 0;
	    this._cost = 0;
        this._cutLossTarget = null;
	    if (numberOfPositions !== undefined && price !== undefined) {
		    this.add(numberOfPositions, price, commission);
	    }
    }

    add (number, price, commission) {
        this._numberOfPositions += number;
        this._cost += ((price * number) + commission);
    }

    remove (number) {
        this._cost *= (this._numberOfPositions - number) / this._numberOfPositions;
	    this._numberOfPositions -= number;
    }

    symbol () {
        return this._symbol;
    }

    number () {
        return this._numberOfPositions;
    }

    cost () {
        return this._cost;
    }

    averageCost () {
        if (this._numberOfPositions != 0) {
            return this._cost / this._numberOfPositions;
        } else {
            return 0;
        }
    }

    cutLossTarget () {
        return this._cutLossTarget;
    }

    setCutLossTarget (target) {
        this._cutLossTarget = target;
    }

    last () {
    	return this._last;
    }

    setLast (last) {
		this._last = last;
    }

}

module.exports = Position;