var util = require('./util');
var Promise = Promise || require("bluebird");

/**
 * Represents an network
 * @param {Object} modem docker-modem
 * @param {String} id  Network's id
 */
var Network = function(modem, id) {
  this.modem = modem;
  this.id = id;
};

/**
 * Inspect
 * @param  {Function} callback Callback, if specified Docker will be queried.
 * @return {Object}            Id only if callback isn't specified.
 */
Network.prototype.inspect = function(callback) {
  var opts = {
    path: '/networks/' + this.id,
    method: 'GET',
    statusCodes: {
      200: true,
      404: 'no such network',
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
 * Removes the network
 * @param  {[Object]}   opts     Remove options (optional)
 * @param  {Function} callback Callback
 */
Network.prototype.remove = function(opts, callback) {
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/networks/' + this.id,
    method: 'DELETE',
    statusCodes: {
      200: true,
      204: true,
      404: 'no such network',
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

/**
 * Connects a container to a network
 * @param  {[Object]}   opts     Connect options (optional)
 * @param  {Function} callback Callback
 */
Network.prototype.connect = function(opts, callback) {
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/networks/' + this.id + '/connect',
    method: 'POST',
    statusCodes: {
      200: true,
      201: true,
      404: 'network or container is not found',
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


/**
 * Disconnects a container from a network
 * @param  {[Object]}   opts     Disconnect options (optional)
 * @param  {Function} callback Callback
 */
Network.prototype.disconnect = function(opts, callback) {
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/networks/' + this.id + '/disconnect',
    method: 'POST',
    statusCodes: {
      200: true,
      201: true,
      404: 'network or container is not found',
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

module.exports = Network;
