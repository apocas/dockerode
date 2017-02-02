var util = require('./util');

/**
 * Represents a secret
 * @param {Object} modem docker-modem
 * @param {String} id  Secret's id
 */
var Secret = function(modem, id) {
  this.modem = modem;
  this.id = id;
};

/**
 * Inspect
 * @param  {Function} callback Callback, if specified Docker will be queried.
 * @return {Object}            Name only if callback isn't specified.
 */
Secret.prototype.inspect = function(callback) {
  if (typeof callback !== 'function') {
    return JSON.stringify({
      id: this.id
    });
  }

  var opts = {
    path: '/secrets/' + this.id,
    method: 'GET',
    statusCodes: {
      200: true,
      404: 'secret not found',
      406: 'node is not part of a swarm',
      500: 'server error'
    }
  };

  this.modem.dial(opts, function(err, data) {
    callback(err, data);
  });
};

/**
 * Update a secret.
 *
 * @param {object} options
 * @param {function} callback
 */
Secret.prototype.update = function(opts, callback) {
  if (!callback && typeof opts === 'function') {
    callback = opts;
  }

  var optsf = {
    path: '/secrets/' + this.id + '/update?',
    method: 'POST',
    statusCodes: {
      200: true,
      404: 'secret not found',
      500: 'server error'
    },
    options: opts
  };

  this.modem.dial(optsf, function(err, data) {
    callback(err, data);
  });
};


/**
 * Removes the secret
 * @param  {[Object]}   opts     Remove options (optional)
 * @param  {Function} callback Callback
 */
Secret.prototype.remove = function(opts, callback) {
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/secrets/' + this.id,
    method: 'DELETE',
    statusCodes: {
      200: true,
      204: true,
      404: 'secret not found',
      500: 'server error'
    },
    options: args.opts
  };

  this.modem.dial(optsf, function(err, data) {
    args.callback(err, data);
  });
};



module.exports = Secret;
