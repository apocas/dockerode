var util = require('./util');

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
 * Get
 * @param  {Function} callback Callback with data stream.
 */

Network.prototype.get = function(callback) {
    if (typeof callback === 'function') {
      var opts = {
        path: '/networks/' + this.id,
        method: 'GET',
        statusCodes: {
          200: true,
          404: 'no such network',
          500: 'server error'
        }
      };

      this.modem.dial(opts, function(err, data) {
        callback(err, data);
      });
    } else {
      return JSON.stringify({Id: this.id});
    }
}

/**
 * Inspect
 * @param  {Function} callback Callback, if specified Docker will be queried.
 * @return {Object}            Id only if callback isn't specified.
 */
Network.prototype.inspect = function(callback) {
  if (typeof callback === 'function') {
    var opts = {
      path: '/networks/' + this.id,
      method: 'GET',
      statusCodes: {
        200: true,
        404: 'no such network',
        500: 'server error'
      }
    };

    this.modem.dial(opts, function(err, data) {
      callback(err, data);
    });
  } else {
    return JSON.stringify({Id: this.id});
  }
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

  this.modem.dial(optsf, function(err, data) {
    args.callback(err, data);
  });
};

module.exports = Network;
