var util = require('./util');
var Promise = Promise || require("bluebird");

/**
 * Represents an image
 * @param {Object} modem docker-modem
 * @param {String} name  Image's name
 */
var Image = function(modem, name) {
  this.modem = modem;
  this.name = name;
};

/**
 * Inspect
 * @param  {Function} callback Callback, if specified Docker will be queried.
 * @return {Object}            Name only if callback isn't specified.
 */
Image.prototype.inspect = function(callback) {
  var opts = {
    path: '/images/' + this.name + '/json',
    method: 'GET',
    statusCodes: {
      200: true,
      404: 'no such image',
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
 * History
 * @param  {Function} callback Callback
 */
Image.prototype.history = function(callback) {
  var opts = {
    path: '/images/' + this.name + '/history',
    method: 'GET',
    statusCodes: {
      200: true,
      404: 'no such image',
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
 * Get
 * @param  {Function} callback Callback with data stream.
 */
Image.prototype.get = function(callback) {
  var opts = {
    path: '/images/' + this.name + '/get',
    method: 'GET',
    isStream: true,
    statusCodes: {
      200: true,
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
 * Push
 * @param  {Object}   opts     Push options, like 'registry' (optional)
 * @param  {Function} callback Callback with stream.
 * @param  {Object}   auth     Registry authentication
 */
Image.prototype.push = function(opts, callback, auth) {
  var self = this;
  var optsf = {
    path: '/images/' + this.name + '/push?',
    method: 'POST',
    options: opts,
    authconfig: opts.authconfig || auth,
    isStream: true,
    statusCodes: {
      200: true,
      404: 'no such image',
      500: 'server error'
    }
  };

  delete optsf.options.authconfig;

  return new Promise(function(resolve, reject){
    this.modem.dial(opts, function(err, data) {
      if(err && !callback) return reject(err);
      callback ? callback(err, data) : resolve(data);
    });
  }.bind(this));
};

/**
 * Tag
 * @param  {Object}   opts     Tag options, like 'repo' (optional)
 * @param  {Function} callback Callback
 */
Image.prototype.tag = function(opts, callback) {
  var self = this;
  var optsf = {
    path: '/images/' + this.name + '/tag?',
    method: 'POST',
    options: opts,
    statusCodes: {
      200: true, // unofficial, but proxies may return it
      201: true,
      400: 'bad parameter',
      404: 'no such image',
      409: 'conflict',
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
 * Removes the image
 * @param  {[Object]}   opts     Remove options (optional)
 * @param  {Function} callback Callback
 */
Image.prototype.remove = function(opts, callback) {
  var args = util.processArgs(opts, callback);


  var optsf = {
    path: '/images/' + this.name + '?',
    method: 'DELETE',
    statusCodes: {
      200: true,
      404: 'no such image',
      409: 'conflict',
      500: 'server error'
    },
    options: args.opts
  };

  return new Promise(function(resolve, reject){
    this.modem.dial(opts, function(err, data) {
      if(err && !callback) return reject(err);
      callback ? callback(err, data) : resolve(data);
    });
  }.bind(this));
};

module.exports = Image;
