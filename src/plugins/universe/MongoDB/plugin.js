'use strict';

const MongoClient = require('mongodb').MongoClient;
const moment = require('moment');
const logger = require('winston');

class MongoDBUniverse {

    constructor (config) {
        this._config = config;
    }

    init () {
        logger.debug('Source Plugin: Initialize MongoDB database connection. Use ' + this._config.connectionString);
        return new Promise((resolve, reject) => {
            if (!this._db) {
                MongoClient.connect(this._config.connectionString, (err, db) => {
                    if (err) {
                        reject(err);
                    } else {
                        logger.debug('MongoDB database connection established');
                        this._db = db;
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    getAllSymbols () {
        return new Promise((resolve, reject) => {
            this._db.listCollections().toArray((err, collInfos) => {
                if (!err) {
                    var output = collInfos.map((item) => {
                        return item.name;
                    });
                    resolve(output);
                } else {
                    reject(err);
                }
            });
        });
    }

}

module.exports = MongoDBUniverse;