var extend = require('./util').extend,
  Exec = require('./exec'),
  util = require('./util');

/**
 * Represents a Container
 * @param {Object} modem docker-modem
 * @param {String} id    Container's ID
 */
var Container = function(modem, id) {
  this.modem = modem;
  this.id = id;

  this.defaultOptions = {
    top: {},
    start: {},
    commit: {},
    stop: {},
    pause: {},
    unpause: {},
    restart: {},
    resize: {},
    attach: {},
    remove: {},
    copy: {},
    kill: {},
    exec: {},
    rename: {},
    log: {},
    stats: {}
  };
};

/**
 * Inspect
 * @param  {Function} callback Callback, if supplied will query Docker.
 * @return {Object}            ID only and only if callback isn't supplied.
 */
Container.prototype.inspect = function(callback) {
  if (typeof callback === 'function') {
    var optsf = {
      path: '/containers/' + this.id + '/json',
      method: 'GET',
      statusCodes: {
        200: true,
        404: 'no such container',
        500: 'server error'
      }
    };

    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  } else {
    return JSON.stringify({
      id: this.id
    });
  }
};

/**
* Rename
* @param  {Object}   opts     Rename options
* @param  {Function} callback Callback
*/
Container.prototype.rename = function(opts, callback) {
  var args = util.processArgs(opts, callback, this.defaultOptions.rename);

  var optsf = {
    path: '/containers/' + this.id + '/rename?',
    method: 'POST',
    statusCodes: {
      200: true,
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  this.modem.dial(optsf, function(err, data) {
    args.callback(err, data);
  });
};

/**
 * Top
 * @param  {Object}   Options like 'ps_args' (optional)
 * @param  {Function} callback Callback
 */
Container.prototype.top = function(opts, callback) {
  var args = util.processArgs(opts, callback, this.defaultOptions.top);

  var optsf = {
    path: '/containers/' + this.id + '/top?',
    method: 'GET',
    statusCodes: {
      200: true,
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  this.modem.dial(optsf, function(err, data) {
    args.callback(err, data);
  });
};

/**
 * Containers changes
 * @param  {Function} callback Callback
 */
Container.prototype.changes = function(callback) {
  var optsf = {
    path: '/containers/' + this.id + '/changes',
    method: 'GET',
    statusCodes: {
      200: true,
      404: 'no such container',
      500: 'server error'
    }
  };

  this.modem.dial(optsf, function(err, data) {
    callback(err, data);
  });
};

/**
 * Export
 * @param  {Function} callback Callback with the octet-stream.
 */
Container.prototype.export = function(callback) {
  var optsf = {
    path: '/containers/' + this.id + '/export',
    method: 'GET',
    isStream: true,
    statusCodes: {
      200: true,
      404: 'no such container',
      500: 'server error'
    }
  };

  this.modem.dial(optsf, function(err, data) {
    callback(err, data);
  });
};

/**
 * Start
 * @param  {Object}   opts     Container start options (optional)
 * @param  {Function} callback Callback
 */
Container.prototype.start = function(opts, callback) {
  var args = util.processArgs(opts, callback, this.defaultOptions.start);

  var optsf = {
    path: '/containers/' + this.id + '/start',
    method: 'POST',
    statusCodes: {
      204: true,
      304: 'container already started',
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  this.modem.dial(optsf, function(err, data) {
    args.callback(err, data);
  });
};

/**
 * Pause
 * @param  {Object}   opts     Pause options (optional)
 * @param  {Function} callback Callback
 */
Container.prototype.pause = function(opts, callback) {
  var args = util.processArgs(opts, callback, this.defaultOptions.pause);

  var optsf = {
    path: '/containers/' + this.id + '/pause',
    method: 'POST',
    statusCodes: {
      204: true,
      500: 'server error'
    },
    options: args.opts
  };

  this.modem.dial(optsf, function(err, data) {
    args.callback(err, data);
  });
};

/**
 * Unpause
 * @param  {Object}   opts     Unpause options (optional)
 * @param  {Function} callback Callback
 */
Container.prototype.unpause = function(opts, callback) {
  var args = util.processArgs(opts, callback, this.defaultOptions.unpause);

  var optsf = {
    path: '/containers/' + this.id + '/unpause',
    method: 'POST',
    statusCodes: {
      204: true,
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  this.modem.dial(optsf, function(err, data) {
    args.callback(err, data);
  });
};

/**
 * Setup an exec call to a running container
 *
 * @param {object} opts
 * @param {function} callback
 */
Container.prototype.exec = function(opts, callback) {
  var args = util.processArgs(opts, callback, this.defaultOptions.exec);

  var optsf = {
    path: '/containers/' + this.id + '/exec',
    method: 'POST',
    statusCodes: {
      201: true,
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  var self = this;
  this.modem.dial(optsf, function(err, data) {
    if(err) return args.callback(err, data);
    args.callback(err, new Exec(self.modem, data.Id));
  });
};

/**
 * Commit
 * @param  {Object}   opts     Commit options like 'Hostname' (optional)
 * @param  {Function} callback Callback
 */
Container.prototype.commit = function(opts, callback) {
  var args = util.processArgs(opts, callback, this.defaultOptions.commit);

  args.opts.container = this.id;

  var optsf = {
    path: '/commit?',
    method: 'POST',
    statusCodes: {
      201: true,
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  this.modem.dial(optsf, function(err, data) {
    args.callback(err, data);
  });
};

/**
 * Stop
 * @param  {Object}   opts     Container stop options, like 't' (optional)
 * @param  {Function} callback Callback
 */
Container.prototype.stop = function(opts, callback) {
  var args = util.processArgs(opts, callback, this.defaultOptions.stop);

  var optsf = {
    path: '/containers/' + this.id + '/stop?',
    method: 'POST',
    statusCodes: {
      204: true,
      304: 'container already stopped',
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  this.modem.dial(optsf, function(err, data) {
    args.callback(err, data);
  });
};

/**
 * Restart
 * @param  {Object}   opts     Container restart options, like 't' (optional)
 * @param  {Function} callback Callback
 */
Container.prototype.restart = function(opts, callback) {
  var args = util.processArgs(opts, callback, this.defaultOptions.restart);

  var optsf = {
    path: '/containers/' + this.id + '/restart',
    method: 'POST',
    statusCodes: {
      204: true,
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  this.modem.dial(optsf, function(err, data) {
    args.callback(err, data);
  });
};

/**
 * Kill
 * @param  {Object}   opts     Container kill options, like 'signal' (optional)
 * @param  {Function} callback Callback
 */
Container.prototype.kill = function(opts, callback) {
  var args = util.processArgs(opts, callback, this.defaultOptions.kill);

  var optsf = {
    path: '/containers/' + this.id + '/kill?',
    method: 'POST',
    statusCodes: {
      204: true,
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  this.modem.dial(optsf, function(err, data) {
    args.callback(err, data);
  });
};

/**
 * Container resize
 * @param  {[type]}   opts     Resize options. (optional)
 * @param  {Function} callback Callback
 */
Container.prototype.resize = function(opts, callback) {
  var args = util.processArgs(opts, callback, this.defaultOptions.resize);

  var optsf = {
    path: '/containers/' + this.id + '/resize?',
    method: 'POST',
    statusCodes: {
      200: true,
      400: 'bad parameter',
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  this.modem.dial(optsf, function(err, data) {
    args.callback(err, data);
  });
};

/**
 * Attach
 * @param  {Object}   opts     Attach options, like 'logs' (optional)
 * @param  {Function} callback Callback with stream.
 */
Container.prototype.attach = function(opts, callback) {
  var args = util.processArgs(opts, callback, this.defaultOptions.attach);

  var optsf = {
    path: '/containers/' + this.id + '/attach?',
    method: 'POST',
    isStream: true,
    openStdin: opts.stdin,
    statusCodes: {
      200: true,
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  this.modem.dial(optsf, function(err, stream) {
    args.callback(err, stream);
  });
};

/**
 * Waits for a container to end.
 * @param  {Function} callback Callback
 */
Container.prototype.wait = function(callback) {
  var optsf = {
    path: '/containers/' + this.id + '/wait',
    method: 'POST',
    statusCodes: {
      200: true,
      400: 'bad parameter',
      404: 'no such container',
      500: 'server error'
    }
  };

  this.modem.dial(optsf, function(err, data) {
    callback(err, data);
  });
};

/**
 * Removes a container
 * @param  {Object}   opts     Remove options, like 'force' (optional)
 * @param  {Function} callback Callback
 */
Container.prototype.remove = function(opts, callback) {
  var args = util.processArgs(opts, callback, this.defaultOptions.remove);

  var optsf = {
    path: '/containers/' + this.id + '?',
    method: 'DELETE',
    statusCodes: {
      204: true,
      400: 'bad parameter',
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  this.modem.dial(optsf, function(err, data) {
    args.callback(err, data);
  });
};

/**
 * Copy
 * @param  {Object}   opts     Copy options, like 'Resource' (optional)
 * @param  {Function} callback Callback with stream.
 */
Container.prototype.copy = function(opts, callback) {
  var args = util.processArgs(opts, callback, this.defaultOptions.copy);

  var optsf = {
    path: '/containers/' + this.id + '/copy',
    method: 'POST',
    isStream: true,
    statusCodes: {
      200: true,
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  this.modem.dial(optsf, function(err, data) {
    args.callback(err, data);
  });
};

/**
 * Container logs
 * @param  {Object}   opts     Logs options. (optional)
 * @param  {Function} callback Callback with data
 */
Container.prototype.logs = function(opts, callback) {
  var args = util.processArgs(opts, callback, this.defaultOptions.log);

  var optsf = {
    path: '/containers/' + this.id + '/logs?',
    method: 'GET',
    isStream: true,
    statusCodes: {
      200: true,
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  this.modem.dial(optsf, function(err, data) {
    args.callback(err, data);
  });
};

/**
* Container stats
* @param  {Object}   opts     Stats options. (optional)
* @param  {Function} callback Callback with data
*/
Container.prototype.stats = function(opts, callback) {
  var args = util.processArgs(opts, callback, this.defaultOptions.stats);

  var optsf = {
    path: '/containers/' + this.id + '/stats?',
    method: 'GET',
    isStream: true,
    statusCodes: {
      200: true,
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  this.modem.dial(optsf, function(err, data) {
    args.callback(err, data);
  });
};

module.exports = Container;
