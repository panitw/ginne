'use strict';

class Position {

    constructor (numberOfPositions) {
        if (numberOfPositions === undefined) {
            numberOfPositions = 0;
        }
        this._numberOfPositions = numberOfPositions;
    }

    number () {
        return this._numberOfPositions;
    }

    setNumber (numberOfPositions) {
        this._numberOfPositions = numberOfPositions;
    }

}

module.exports = Position;