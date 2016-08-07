'use strict';

class Screener {

    constructor(universe) {
        this._universe = universe;
        this._commandList = [];
    }

    addAnalysis (columnName, analysisOptions) {
        this._commandList.push({
            cmd: 'ANALYSIS',
            column: columnName,
            options: analysisOptions
        });
        return this;
    }

    mask (columnName, maskingFunction) {
        this._commandList.push({
            cmd: 'MASK',
            column: columnName,
            func: maskingFunction
        });
        return this;
    }

    universe () {
        return this._universe;
    }

    commands () {
        return this._commandList;
    }

}

module.exports = Screener;