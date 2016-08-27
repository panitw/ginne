var setReader = require('set-data-reader');

setReader.read().then(function (data) {
	var symbols = data.map(function (item) {
		return item.symbol;
	});
	symbols.sort();
	console.log(JSON.stringify(symbols));
});