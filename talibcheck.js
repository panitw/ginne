'use strict';

const talib = require('talib');

console.log('TALib Version: ' + talib.version);

let taFunction = process.argv[2];
let function_desc = talib.explain(taFunction);

console.log(JSON.stringify(function_desc, null, 2));

let data = [0,1,2,3,4];
talib.execute({
    name: "LINEARREG_SLOPE",
    startIdx: 0,
    endIdx: data.length - 1,
    inReal: data,
    optInTimePeriod: 5
}, function (result) {
    console.log("LINEARREG_SLOPE Function Results:");
    console.log(result);
});