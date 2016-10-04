app.service('daemonConnector', function ($rootScope) {

	this.socket = null;

	this.connect = function () {
		this.socket = io.connect('/');
		this.socket.on('connect', function () {
			$rootScope.$emit('daemonConnected');
		});
		this.socket.on('disconnect', function () {
			$rootScope.$emit('daemonDisconnected');
		})
	};

	this.subscribe = function(channel, callback) {
		if (this.socket) {
			this.socket.on(channel, callback);
		} else {
			throw new Error('No connection available');
		}
	};

	this.publish = function (channel, data) {
		if (this.socket) {
			this.socket.emit(channel, data);
		} else {
			throw new Error('No connection available');
		}
	};

});