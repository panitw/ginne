'use strict';

const ps = require('psnode');
const rest = require('restler');
const exec = require('child_process').exec;
const logger = require('winston');
const request = require('request');

class Eikon {

	constructor(env) {
		this._currentToken = null;
		this._env = env;
		this._serviceEndpoint = {
			alpha: 'https://amers1.apps.cp.icp2.mpp.reutest.com',
			beta: 'https://amers1.apps.cp.reutest.com',
			prod: 'https://amers1.apps.cp.thomsonreuters.com'
		};
	}

	isEikonRunning(callback) {
		ps.list((err, resultList) => {
			if (!err) {
				var eikonProc = resultList.filter((result) => {
					if (result.command === 'Eikon.exe') {
						return result;
					}
				});
				if (eikonProc.length > 0) {
					callback(null, true);
				} else {
					callback(null, false);
				}
			} else {
				callback(err);
			}
		});
	}

	getCurrentToken(callback) {
		if (this._currentToken != null) {
			callback(null, this._currentToken);
		} else {
			logger.debug('Getting Eikon SSO token');
			this.isEikonRunning((err, isRunning) => {
				if (err) {
					logger.debug("Eikon Desktop is not running, unable to get SSO token");
					callback(err);
				} else {
					if (isRunning) {
						logger.debug('Eikon Desktop is running, acquiring SSO token from current Eikon session');
						exec(__dirname + '/token-getter.exe ' + this._env, (err, stdout) => {
							if (stdout !== null && stdout !== undefined && stdout !== '') {
								logger.debug('SSOToken=' + stdout);
								this._currentToken = stdout;
								callback(null, stdout);
							} else {
								this._currentToken = null;
								callback('Error: Got empty SSOToken from the running Eikon Desktop for environment "' + this._env + '"');
							}
						});
					} else {
						logger.debug('Eikon Desktop not running. Trying to login using the credential in eikon-account.json');				
					}
				}
			});
		}
	}

	postData(url, data) {
		return new Promise((resolve, reject) => {
			this.getCurrentToken((err, token) => {
				var finalUrl = this._serviceEndpoint[this._env] + url;
				request({
					url: finalUrl,
					body: data,
					json: true,
					method: 'POST',
					headers: {
						'Cookie': 'iPlanetDirectoryPro=' + encodeURIComponent(token)
					}
				}, function (error, response, data) {
					if (error) {
						if (error.code === 'ECONNREFUSED') {
							logger.error('Refused connection');
						}
						reject(error);
					} else {
						resolve(data);
					}
				});
			});
		});
	}
	
}

module.exports = Eikon;
