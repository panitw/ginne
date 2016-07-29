'use strict';

const talib = require('talib');

console.log('TALib Version: ' + talib.version);

let taFunction = process.argv[2];
let function_desc = talib.explain(taFunction);

console.log(JSON.stringify(function_desc, null, 2));

let data = [123];
let volume = [1000];
talib.execute({
    name: "OBV",
    startIdx: 0,
    endIdx: data.length - 1,
    inReal: data,
    volume: volume,
    optInTimePeriod: 20
}, function (result) {
    console.log("OBV Function Results:");
    console.log(result);
});