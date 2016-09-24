'use strict';

var request = require('request-promise');

class GithubAPI {

	constructor (user, accessToken) {
		this._endpoint = 'https://api.github.com';
		this._user = user;
		this._token = accessToken;
	}

	listAllGist () {
		var options = {
			uri: this._endpoint + '/users/' + this._user + '/gists',
			qs: {
				access_token: this._token
			},
			headers: {
				'User-Agent': 'node.js',
				'Authorization': 'token ' + this._token
			},
			json: true
		}
		return request(options);
	}

	getGist (id) {
		var options = {
			uri: this._endpoint + '/gists/' + id,
			qs: {
				access_token: this._token
			},
			headers: {
				'user-agent': 'node.js'
			},
			json: true
		};
		return request(options)
			.then((gistData) => {
				let firstFile = null;
				for (var file in gistData.files) {
					firstFile = gistData.files[file];
					break;
				}
				if (firstFile) {
					return firstFile.content;
				} else {
					return null;
				}
			});
	}

	createGist (fileName, description, content) {
		let files = {};
		files[fileName] = {
			content: content
		};
		let options = {
			method: 'POST',
			uri: this._endpoint + '/gists',
			body: {
				description: description,
				public: false,
				files: files
			},
			headers: {
				'User-Agent': 'node.js',
				'Authorization': 'token ' + this._token
			},
			json: true
		};
		return request(options);
	}

	editGist (id, fileName, newDescription, newContent) {
		let body = {
			description: newDescription
		};

		if (newContent !== undefined) {
			let files = {};
			files[fileName] = {
				content: newContent
			};
			body.files = files;
		}
		let options = {
			method: 'PATCH',
			uri: this._endpoint + '/gists/' + id,
			body: body,
			headers: {
				'User-Agent': 'node.js',
				'Authorization': 'token ' + this._token
			},
			json: true
		};
		return request(options);
	}

	deleteGist (id) {
		let options = {
			method: 'DELETE',
			uri: this._endpoint + '/gists/' + id,
			headers: {
				'User-Agent': 'node.js',
				'Authorization': 'token ' + this._token
			}
		};
		return request(options);
	}
}

module.exports = GithubAPI;