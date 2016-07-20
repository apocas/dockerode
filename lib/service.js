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
Service.prototype.update = function(opts, callback) {
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/services/' + this.id + '/update?',
    method: 'POST',
    statusCodes: {
      200: true,
      404: 'no such service',
      500: 'server error'
    },
    options: args.opts
  };

  this.modem.dial(optsf, function(err, data) {
    args.callback(err, data);
  });
};


module.exports = Service;
