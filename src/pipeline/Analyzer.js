'use strict';

class Analyzer {

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

    setUniverse (universe) {
        this._universe = universe;
	    return this;
    }

    commands () {
        return this._commandList;
    }

}

module.exports = Analyzer;