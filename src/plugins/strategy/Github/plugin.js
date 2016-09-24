'use strict';

const GithubAPI = require('./GithubAPI');
const vm = require('vm');

class GithubStrategy {

	constructor (config) {
		this._config = config;
		this._user = process.env.GINNE_GITHUB_USER;
		this._accessToken = process.env.GINNE_GITHUB_TOKEN;
		this._api = new GithubAPI(this._user, this._accessToken);
	}

	init () {
		return Promise.resolve();
	}

	_createStrategyObj (code) {
		let script = new vm.Script(code);
		let Strategy = script.runInNewContext();
		let strategyObj = new Strategy();
		return strategyObj;
	}

	_validateStrategy (source) {
		if (source === undefined) {
			return Promise.resolve();
		}
		try {
			let strategyObj = this._createStrategyObj(source);
			if (!strategyObj.analyze || !strategyObj.execute) {
				throw new Error('Missing analyze() and/or execute() method.');
			}
		}
		catch (ex) {
			return Promise.reject(new Error('Invalid strategy code: ' + ex.message));
		}
		return Promise.resolve();
	}

	setMasterStrategy (id) {
		let currentMaster = null;
		let newMaster = null;
		return this.getStrategyList()
			.then((list) => {
				list.forEach((item) => {
					if (item.name.indexOf('MASTER:') === 0) {
						currentMaster = item;
					}
					if (item.id === id) {
						newMaster = item;
					}
				});
				if (newMaster && currentMaster && newMaster.id === currentMaster.id) {
					throw 'ALREADY_SET';
				}
			})
			.then(() => {
				if (newMaster && currentMaster) {
					return this.updateStrategy(currentMaster.id, currentMaster.name.replace('MASTER:', ''));
				}
			})
			.then(() => {
				if (newMaster) {
					return this.updateStrategy(newMaster.id, 'MASTER:' + newMaster.name);
				} else {
					throw new Error('Invalid strategy id ' + id);
				}
			})
			.catch((err) => {
				if (err !== 'ALREADY_SET') {
					throw err;
				}
			});
	}

	getStrategy (id) {
		if (id !== undefined) {
			return this._api.getGist(id).then((code) => {
				return this._createStrategyObj(code);
			});
		} else {
			return this.getStrategyList()
				.then((list) => {
					let masterStrategyId = null;
					list.some((item) => {
						if (item.name.indexOf('MASTER:') === 0) {
							masterStrategyId = item.id;
							return true;
						}
					});
					if (masterStrategyId) {
						return this.getStrategy(masterStrategyId);
					}
				});
		}
	}

	getStrategyCode (id) {
		return this._api.getGist(id);
	}


	getStrategyList() {
		return this._api.listAllGist()
			.then((result) => {
				let list = [];
				result.forEach((item) => {
					if (item.description.indexOf('GINNE:') === 0) {
						list.push({
							id: item.id,
							name: item.description.replace('GINNE:', '')
						});
					}
				});
				return list;
			});
	}

	createStrategy(name, source) {
		return this._validateStrategy(source)
			.then(() => {
				return this._api.createGist('strategy.js', 'GINNE:' + name, source);
			})
			.then((response) => {
				if (response) {
					return response.id;
				}
			});
	}

	updateStrategy(id, newName, newSource) {
		return this._validateStrategy(newSource)
			.then(() => {
				return this._api.editGist(id, 'strategy.js', 'GINNE:' + newName, newSource);
			});
	}

	deleteStrategy(id) {
		return this._api.deleteGist(id);
	}
}

module.exports = GithubStrategy;