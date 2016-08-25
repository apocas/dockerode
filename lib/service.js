var util = require('./util');

/**
 * Represents an Service
 * @param {Object} modem docker-modem
 * @param {String} id    Service's ID
 */
var Service = function(modem, id) {
  this.modem = modem;
  this.id = id;
};


/**
 * Query Docker for service details.
 *
 * @param {function} callback
 */
Service.prototype.inspect = function(callback) {
  if (typeof callback !== 'function') {
    return JSON.stringify({
      id: this.id
    });
  }

  var optsf = {
    path: '/services/' + this.id,
    method: 'GET',
    statusCodes: {
      200: true,
      404: 'no such service',
      500: 'server error'
    }
  };

  this.modem.dial(optsf, function(err, data) {
    callback(err, data);
  });
};

/**
 * Delete Service
 *
 * @param {function} callback
 */
Service.prototype.remove = function(callback) {
  var optsf = {
    path: '/services/' + this.id,
    method: 'DELETE',
    statusCodes: {
      200: true,
      204: true,
      404: 'no such service',
      500: 'server error'
    }
  };

  this.modem.dial(optsf, function(err, data) {
    callback(err, data);
  });
};

/**
 * Update service
 *
 * @param {object} options
 * @param {function} callback
 */
Service.prototype.update = function(auth, opts, callback) {
  if (!callback && typeof opts === 'function') {
    callback = opts;
    opts = auth;
    auth = opts.authconfig || undefined;
  }
  var optsf = {
    path: '/services/' + this.id + '/update?',
    method: 'POST',
    statusCodes: {
      200: true,
      404: 'no such service',
      500: 'server error'
    },
    authconfig: auth,
    options: opts
  };
  this.modem.dial(optsf, function(err, data) {
    callback(err, data);
  });
};


module.exports = Service;
