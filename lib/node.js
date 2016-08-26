var util = require('./util');

/**
 * Represents an Node
 * @param {Object} modem docker-modem
 * @param {String} id    Node's ID
 */
var Node = function(modem, id) {
  this.modem = modem;
  this.id = id;
};

/**
 * Query Docker for Node details.
 *
 * @param {object} options
 * @param {function} callback
 */
Node.prototype.inspect = function(callback) {
  if (typeof callback !== 'function') {
    return JSON.stringify({
      id: this.id
    });
  }

  var optsf = {
    path: '/nodes/' + this.id,
    method: 'GET',
    statusCodes: {
      200: true,
      404: 'no such node',
      500: 'server error'
    }
  };

  this.modem.dial(optsf, function(err, data) {
    callback(err, data);
  });
};


/**
 * Remove a Node.
 * Warning: This method is not documented in the API.
 *
 * @param {object} options
 * @param {function} callback
 */
Node.prototype.remove = function(callback) {
  if (typeof callback !== 'function') {
    return JSON.stringify({
      id: this.id
    });
  }

  var optsf = {
    path: '/nodes/' + this.id,
    method: 'DELETE',
    statusCodes: {
      200: true,
      404: 'no such node',
      500: 'server error'
    }
  };

  this.modem.dial(optsf, function(err, data) {
    callback(err, data);
  });
};


module.exports = Node;
