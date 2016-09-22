var socket = io.connect('/');

function logOutput(data) {
	var output = document.getElementById('output');
	output.innerHTML = output.innerHTML + JSON.stringify(data) + '<br>';
}

socket.on('news', function (data) {
	logOutput(data);
});