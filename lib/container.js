var extend = require('./util').extend,
  Exec = require('./exec'),
  util = require('./util');
var Promise = Promise || require("bluebird");

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
    stats: {},
    getArchive: {},
    infoArchive: {},
    putArchive: {},
    update: {}
  };
};

/**
 * Inspect
 * @param  {Options}  opts     Options (optional)
 * @param  {Function} callback Callback, if supplied will query Docker.
 * @return {Object}            ID only and only if callback isn't supplied.
 */
Container.prototype.inspect = function(opts, callback) {
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/containers/' + this.id + '/json?',
    method: 'GET',
    options: args.opts,
    statusCodes: {
      200: true,
      404: 'no such container',
      500: 'server error'
    }
  };

  return new Promise(function(resolve, reject){
    this.modem.dial(optsf, function(err, data) {
      if(err && !args.callback) return reject(err);
      args.callback ? args.callback(err, data) : resolve(data);
    });
  }.bind(this));
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
      204: true,
      404: 'no such container',
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
 * Update
 * @param  {Object}   opts     Update options
 * @param  {Function} callback Callback
 */
Container.prototype.update = function(opts, callback) {
  var args = util.processArgs(opts, callback, this.defaultOptions.update);

  var optsf = {
    path: '/containers/' + this.id + '/update',
    method: 'POST',
    statusCodes: {
      200: true,
      204: true,
      400: 'bad parameter',
      404: 'no such container',
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

  return new Promise(function(resolve, reject){
    this.modem.dial(optsf, function(err, data) {
      if(err && !args.callback) return reject(err);
      args.callback ? args.callback(err, data) : resolve(data);
    });
  }.bind(this));
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

  return new Promise(function(resolve, reject){
    this.modem.dial(optsf, function(err, data) {
      if(err && !callback) return reject(err);
      callback ? callback(err, data) : resolve(data);
    });
  }.bind(this));
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

  return new Promise(function(resolve, reject){
    this.modem.dial(optsf, function(err, data) {
      if(err && !callback) return reject(err);
      callback ? callback(err, data) : resolve(data);
    });
  }.bind(this));
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
      200: true, // unofficial, but proxies may return it
      204: true,
      304: 'container already started',
      404: 'no such container',
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
      200: true, // unofficial, but proxies may return it
      204: true,
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
      200: true, // unofficial, but proxies may return it
      204: true,
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  return new Promise(function(resolve, reject){
    this.modem.dial(optsf, function(err, data) {
      if(err) return args.callback ? args.callback(err, data) : reject(err);
      args.callback ? args.callback(err, new Exec(self.modem, data.Id)) : resolve(new Exec(self.modem, data.Id));
    });
  }.bind(this));
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
      200: true, // unofficial, but proxies may return it
      201: true,
      404: 'no such container',
      500: 'server error'
    },
    options: args.opts
  };

  var self = this;
  return new Promise(function(resolve, reject){
    this.modem.dial(optsf, function(err, data) {
      if(err && !args.callback) return reject(err);
      args.callback ? args.callback(err, new Exec(self.modem, data.Id)) : resolve(new Exec(self.modem, data.Id));
    });
  }.bind(this));
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
      200: true, // unofficial, but proxies may return it
      201: true,
      404: 'no such container',
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
      200: true, // unofficial, but proxies may return it
      204: true,
      304: 'container already stopped',
      404: 'no such container',
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
      200: true, // unofficial, but proxies may return it
      204: true,
      404: 'no such container',
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
      200: true, // unofficial, but proxies may return it
      204: true,
      404: 'no such container',
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

  return new Promise(function(resolve, reject){
    this.modem.dial(optsf, function(err, data) {
      if(err && !args.callback) return reject(err);
      args.callback ? args.callback(err, data) : resolve(data);
    });
  }.bind(this));
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
    hijack: args.opts.hijack,
    openStdin: args.opts.stdin,
    statusCodes: {
      200: true,
      404: 'no such container',
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

  return new Promise(function(resolve, reject){
    this.modem.dial(optsf, function(err, data) {
      if(err && !callback) return reject(err);
      callback ? callback(err, data) : resolve(data);
    });
  }.bind(this));
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
      200: true, // unofficial, but proxies may return it
      204: true,
      400: 'bad parameter',
      404: 'no such container',
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
 * Copy (WARNING: DEPRECATED since RAPI v1.20)
 * @param  {Object}   opts     Copy options, like 'Resource' (optional)
 * @param  {Function} callback Callback with stream.
 */
Container.prototype.copy = function(opts, callback) {
  console.log('container.copy is deprecated since Docker v1.8.x');
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

  return new Promise(function(resolve, reject){
    this.modem.dial(optsf, function(err, data) {
      if(err && !args.callback) return reject(err);
      args.callback ? args.callback(err, data) : resolve(data);
    });
  }.bind(this));
};

/**
 * getArchive
 * @param  {Object}   opts     Archive options, like 'path'
 * @param  {Function} callback Callback with stream.
 */
Container.prototype.getArchive = function(opts, callback) {
  var args = util.processArgs(opts, callback, this.defaultOptions.getArchive);

  var optsf = {
    path: '/containers/' + this.id + '/archive?',
    method: 'GET',
    isStream: true,
    statusCodes: {
      200: true,
      400: 'client error, bad parameters',
      404: 'no such container',
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
 * infoArchive
 * @param  {Object}   opts     Archive options, like 'path'
 * @param  {Function} callback Callback with stream.
 */
Container.prototype.infoArchive = function(opts, callback) {
  var args = util.processArgs(opts, callback, this.defaultOptions.infoArchive);

  var optsf = {
    path: '/containers/' + this.id + '/archive?',
    method: 'HEAD',
    isStream: true,
    statusCodes: {
      200: true,
      400: 'client error, bad parameters',
      404: 'no such container',
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
 * putArchive
 * @param  {Object}   opts     Archive options, like 'path'
 * @param  {Function} callback Callback with stream.
 */
Container.prototype.putArchive = function(file, opts, callback) {
  var args = util.processArgs(opts, callback, this.defaultOptions.putArchive);

  var optsf = {
    path: '/containers/' + this.id + '/archive?',
    method: 'PUT',
    file: file,
    isStream: true,
    statusCodes: {
      200: true,
      400: 'client error, bad parameters',
      403: 'client error, permission denied',
      404: 'no such container',
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

  return new Promise(function(resolve, reject){
    this.modem.dial(optsf, function(err, data) {
      if(err && !args.callback) return reject(err);
      args.callback ? args.callback(err, data) : resolve(data);
    });
  }.bind(this));
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

  return new Promise(function(resolve, reject){
    this.modem.dial(optsf, function(err, data) {
      if(err && !args.callback) return reject(err);
      args.callback ? args.callback(err, data) : resolve(data);
    });
  }.bind(this));
};

module.exports = Container;
