var util = require('./util');

/**
 * Represents an Task
 * @param {Object} modem docker-modem
 * @param {String} id    Task's ID
 */
var Task = function(modem, id) {
  this.modem = modem;
  this.id = id;
};

/**
 * Query Docker for Task details.
 *
 * @param {object} options
 * @param {function} callback
 */
Task.prototype.inspect = function(callback) {
  if (typeof callback !== 'function') {
    return JSON.stringify({
      id: this.id
    });
  }

  var optsf = {
    path: '/tasks/' + this.id,
    method: 'GET',
    statusCodes: {
      200: true,
      404: 'unknown task',
      500: 'server error'
    }
  };

  this.modem.dial(optsf, function(err, data) {
    callback(err, data);
  });
};


module.exports = Task;
