var util = require('./util');
var Promise = Promise || require("bluebird");

/**
 * Represents an Exec
 * @param {Object} modem docker-modem
 * @param {String} id    Exec's ID
 */
var Exec = function(modem, id) {
  this.modem = modem;
  this.id = id;
};

/**
 * Start the exec call that was setup.
 *
 * @param {object} options
 * @param {function} callback
 */
Exec.prototype.start = function(opts, callback) {
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/exec/' + this.id + '/start',
    method: 'POST',
    isStream: true,
    hijack: args.opts.hijack,
    openStdin: args.opts.stdin,
    statusCodes: {
      200: true,
      204: true,
      404: 'no such exec',
      409: 'container stopped/paused',
      500: 'container not running'
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
 * Resize the exec call that was setup.
 *
 * @param {object} options
 * @param {function} callback
 */
Exec.prototype.resize = function(opts, callback) {
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/exec/' + this.id + '/resize?',
    method: 'POST',
    statusCodes: {
      200: true,
      404: 'no such exec',
      500: 'container not running'
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
 * Get low-level information about the exec call.
 *
 * @param {function} callback
 */
Exec.prototype.inspect = function(callback) {
  var optsf = {
    path: '/exec/' + this.id + '/json',
    method: 'GET',
    statusCodes: {
      200: true,
      404: 'no such exec',
      500: 'server error'
    }
  };

  return new Promise(function(resolve, reject){
    this.modem.dial(optsf, function(err, data) {
      if(err && !callback) return reject(err);
      callback ? callback(err, data) : resolve(data);
    });
  }.bind(this));
};


module.exports = Exec;
