'use strict';

class Position {

    constructor (numberOfPositions) {
        if (numberOfPositions === undefined) {
            numberOfPositions = 0;
        }
        this._numberOfPositions = numberOfPositions;
        this._cutLossTarget = null;
    }

    number () {
        return this._numberOfPositions;
    }

    setNumber (numberOfPositions) {
        this._numberOfPositions = numberOfPositions;
    }

    cutLossTarget () {
        return this._cutLossTarget;
    }

    setCutLossTarget (target) {
        this._cutLossTarget = target;
    }

}

module.exports = Position;