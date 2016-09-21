const BackTestClient = require('./client');

class BackTestDaemon {

	constructor () {
		this._clientList = [];
	}

	handle (socket) {
		let newClient = new BackTestClient(socket);
		this._clientList.push(newClient);

		newClient.on('disconnected', (client) => {
			let index = this._clientList.indexOf(client);
			if (index != -1) {
				this._clientList.splice(index, 1);
			}
		});
	}

}

module.exports = BackTestDaemon;