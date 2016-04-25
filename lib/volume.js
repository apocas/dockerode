var util = require('./util');
var Promise = Promise || require("bluebird");

/**
 * Represents an volume
 * @param {Object} modem docker-modem
 * @param {String} name  Volume's name
 */
var Volume = function(modem, name) {
  this.modem = modem;
  this.name = name;
};

/**
 * Inspect
 * @param  {Function} callback Callback, if specified Docker will be queried.
 * @return {Object}            Name only if callback isn't specified.
 */
Volume.prototype.inspect = function(callback) {
  var opts = {
    path: '/volumes/' + this.name,
    method: 'GET',
    statusCodes: {
      200: true,
      404: 'no such volume',
      500: 'server error'
    }
  };
  return new Promise(function(resolve, reject){
    this.modem.dial(opts, function(err, data) {
      if(err && !callback) return reject(err);
      callback ? callback(err, data) : resolve(data);
    });
  }.bind(this));
};

/**
 * Removes the volume
 * @param  {[Object]}   opts     Remove options (optional)
 * @param  {Function} callback Callback
 */
Volume.prototype.remove = function(opts, callback) {
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/volumes/' + this.name,
    method: 'DELETE',
    statusCodes: {
      204: true,
      404: 'no such volume',
      409: 'conflict',
      500: 'server error'
    },
    options: args.opts
  };

  return new Promise(function(resolve, reject){
    this.modem.dial(optsf, function(err, data) {
      if(err && !args.callback) return reject(err);
      args.callback ? args.callback(err, data) : resolve(data);
    });
  }.bind(this));
};

module.exports = Volume;
