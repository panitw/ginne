'use strict';

class Screener {

    constructor() {
        this.commandList = [];
    }

    universe (universeSymbol) {
        this.commandList.push({
            cmd: 'UNIVERSE',
            symbol: universeSymbol
        });
        return this;
    }

    addAnalysis (columnName, analysisOptions) {
        this.commandList.push({
            cmd: 'ANALYSIS',
            column: columnName,
            options: analysisOptions
        });
        return this;
    }

    mask (maskingFunction) {
        this.commandList.push({
            cmd: 'MASK',
            func: maskingFunction
        });
        return this;
    }

}

module.exports = Screener;