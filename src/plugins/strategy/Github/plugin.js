'use strict';

const GithubAPI = require('./GithubAPI');

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

	getStrategy (id) {
		if (id !== undefined) {
			return this._api.getGist(id);
		} else {
			return Promise.resolve(null);
		}
	}

	getStrategyList() {
		return this._api.listAllGist()
			.then((result) => {
				let list = [];
				result.forEach((item) => {
					if (item.description.indexOf('GINNE:') === 0) {
						list.push({
							id: item.id,
							description: item.description.replace('GINNE:', '')
						});
					}
				});
				return list;
			});
	}

	createStrategy(name, source) {
		return this._api.createGist('strategy.js', 'GINNE:' + name, source);
	}

	updateStrategy(id, newName, newSource) {
		return this._api.editGist(id, 'strategy.js', 'GINNE:' + newName, newSource);
	}

	deleteStrategy(id) {
		return this._api.deleteGist(id);
	}
}

module.exports = GithubStrategy;