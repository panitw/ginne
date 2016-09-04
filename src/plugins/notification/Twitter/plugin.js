'use strict';

var Twitter = require('twitter');
const account = require('./accounts');

class TwitterNotifier {

	constructor (config) {
		let accountConfig = {
			"consumer_key": account.twitter.CONSUMER_KEY,
			"consumer_secret": account.twitter.CONSUMER_SECRET,
			"access_token_key": account.twitter.ACCESS_TOKEN,
			"access_token_secret": account.twitter.ACCESS_TOKEN_SECRET
		};

		this._twitter = new Twitter(accountConfig);
	}

	init () {
	}

	notify (target, message) {
		return new Promise((resolve, reject) => {
			this._twitter.post('direct_messages/new', {
				'screen_name': target,
				'text': message
			},
				(err, response, body) => {
					if (err) {
						reject({
							error: err,
							response: response,
							body: body
						});
					} else {
						resolve();
					}
				}
			);
		});
	}

}

module.exports = TwitterNotifier;