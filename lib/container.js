let extend = require('./util').extend,
  Exec = require('./exec'),
  util = require('./util');

/**
 * Represents a Container
 * @param {Object} modem docker-modem
 * @param {String} id    Container's ID
 */
class Container {
  constructor(modem, id) {
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
  }
  [require('util').inspect.custom]() {
    return this;
  }
  /**
  * Inspect
  * @param  {Options}  opts     Options (optional)
  * @param  {Function} callback Callback, if supplied will query Docker.
  * @return {Object}            ID only and only if callback isn't supplied.
  */
  async inspect(opts, callback) {
    var self = this;
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

    if (args.callback === undefined) {
      return new this.modem.Promise(function (resolve, reject) {
        self.modem.dial(optsf, function (err, data) {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    } else {
      this.modem.dial(optsf, function (err, data) {
        args.callback(err, data);
      });
    }
  };

  /**
   * Rename
   * @param  {Object}   opts     Rename options
   * @param  {Function} callback Callback
   */
  async rename(opts, callback) {
    var self = this;
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

    if (args.callback === undefined) {
      return new this.modem.Promise(function (resolve, reject) {
        self.modem.dial(optsf, function (err, data) {
          if (err) {
            return reject(err);
          }
          self.output = data;
          resolve(self);
        });
      });
    } else {
      this.modem.dial(optsf, function (err, data) {
        args.callback(err, data);
      });
    }
  };

  /**
   * Update
   * @param  {Object}   opts     Update options
   * @param  {Function} callback Callback
   */
  async update(opts, callback) {
    var self = this;
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

    if (args.callback === undefined) {
      return new this.modem.Promise(function (resolve, reject) {
        self.modem.dial(optsf, function (err, data) {
          if (err) {
            return reject(err);
          }
          self.output = data;
          resolve(self);
        });
      });
    } else {
      this.modem.dial(optsf, function (err, data) {
        args.callback(err, data);
      });
    }
  };

  /**
   * Top
   * @param  {Object}   Options like 'ps_args' (optional)
   * @param  {Function} callback Callback
   */
  async top(opts, callback) {
    var self = this;
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

    if (args.callback === undefined) {
      return new this.modem.Promise(function (resolve, reject) {
        self.modem.dial(optsf, function (err, data) {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    } else {
      this.modem.dial(optsf, function (err, data) {
        args.callback(err, data);
      });
    }
  };

  /**
   * Containers changes
   * @param  {Function} callback Callback
   */
  async changes(callback) {
    var self = this;
    var optsf = {
      path: '/containers/' + this.id + '/changes',
      method: 'GET',
      statusCodes: {
        200: true,
        404: 'no such container',
        500: 'server error'
      }
    };

    if (callback === undefined) {
      return new this.modem.Promise(function (resolve, reject) {
        self.modem.dial(optsf, function (err, data) {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    } else {
      this.modem.dial(optsf, function (err, data) {
        callback(err, data);
      });
    }
  };

  /**
   * Checkpoints list
   * @param  {Object}   opts     List checkpoints options (optional)
   * @param  {Function} callback Callback
   */
  async listCheckpoint(opts, callback) {
    var self = this;
    var args = util.processArgs(opts, callback);

    var optsf = {
      path: '/containers/' + this.id + '/checkpoints?',
      method: 'GET',
      statusCodes: {
        200: true,
        404: 'no such container',
        500: 'server error'
      },
      options: args.opts
    };

    if (args.callback === undefined) {
      return new this.modem.Promise(function (resolve, reject) {
        self.modem.dial(optsf, function (err, data) {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    } else {
      this.modem.dial(optsf, function (err, data) {
        args.callback(err, data);
      });
    }
  };


  /**
   * Delete checkpoint
   * @param  {Object}   opts     Delete checkpoint options (optional)
   * @param  {Function} callback Callback
   */
  async deleteCheckpoint(checkpoint, opts, callback) {
    var self = this;
    var args = util.processArgs(opts, callback);

    var optsf = {
      path: '/containers/' + this.id + '/checkpoints/' + checkpoint + '?',
      method: 'DELETE',
      statusCodes: {
        200: true, // unofficial, but proxies may return it
        204: true,
        404: 'no such container',
        500: 'server error'
      },
      options: args.opts
    };

    if (args.callback === undefined) {
      return new this.modem.Promise(function (resolve, reject) {
        self.modem.dial(optsf, function (err, data) {
          if (err) {
            return reject(err);
          }
          self.output = data;
          resolve(self);
        });
      });
    } else {
      this.modem.dial(optsf, function (err, data) {
        args.callback(err, data);
      });
    }
  };

  /**
   * Create checkpoint
   * @param  {Object}   opts     Create checkpoint options (optional)
   * @param  {Function} callback Callback
   */
  async createCheckpoint(opts, callback) {
    var self = this;
    var args = util.processArgs(opts, callback);

    var optsf = {
      path: '/containers/' + this.id + '/checkpoints',
      method: 'POST',
      allowEmpty: true,
      statusCodes: {
        200: true, //unofficial, but proxies may return it
        204: true,
        404: 'no such container',
        500: 'server error'
      },
      options: args.opts
    };

    if (args.callback === undefined) {
      return new this.modem.Promise(function (resolve, reject) {
        self.modem.dial(optsf, function (err, data) {
          if (err) {
            return reject(err);
          }
          self.output = data;
          resolve(self);
        });
      });
    } else {
      this.modem.dial(optsf, function (err, data) {
        args.callback(err, data);
      });
    }
  };


  /**
   * Export
   * @param  {Function} callback Callback with the octet-stream.
   */
  export(callback) {
    var self = this;
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

    if (callback === undefined) {
      return new this.modem.Promise(function (resolve, reject) {
        self.modem.dial(optsf, function (err, data) {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    } else {
      this.modem.dial(optsf, function (err, data) {
        callback(err, data);
      });
    }
  };

  /**
   * Start
   * @param  {Object}   opts     Container start options (optional)
   * @param  {Function} callback Callback
   */
  async start(opts, callback) {
    var self = this;
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

    if (args.callback === undefined) {
      return new this.modem.Promise(function (resolve, reject) {
        self.modem.dial(optsf, function (err, data) {
          if (err) {
            return reject(err);
          }
          self.output = data;
          resolve(self);
        });
      });
    } else {
      this.modem.dial(optsf, function (err, data) {
        args.callback(err, data);
      });
    }
  };

  /**
   * Pause
   * @param  {Object}   opts     Pause options (optional)
   * @param  {Function} callback Callback
   */
  async pause(opts, callback) {
    var self = this;
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

    if (args.callback === undefined) {
      return new this.modem.Promise(function (resolve, reject) {
        self.modem.dial(optsf, function (err, data) {
          if (err) {
            return reject(err);
          }
          self.output = data;
          resolve(self);
        });
      });
    } else {
      this.modem.dial(optsf, function (err, data) {
        args.callback(err, data);
      });
    }
  };

  /**
   * Unpause
   * @param  {Object}   opts     Unpause options (optional)
   * @param  {Function} callback Callback
   */
  async unpause(opts, callback) {
    var self = this;
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

    if (args.callback === undefined) {
      return new this.modem.Promise(function (resolve, reject) {
        self.modem.dial(optsf, function (err, data) {
          if (err) {
            return reject(err);
          }
          self.output = data;
          resolve(self);
        });
      });
    } else {
      this.modem.dial(optsf, function (err, data) {
        args.callback(err, data);
      });
    }
  };

  /**
   * Setup an exec call to a running container
   *
   * @param {object} opts
   * @param {function} callback
   */
  async exec(opts, callback) {
    var self = this;
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


    if (args.callback === undefined) {
      return new this.modem.Promise(function (resolve, reject) {
        self.modem.dial(optsf, function (err, data) {
          if (err) {
            return reject(err);
          }
          resolve(new Exec(self.modem, data.Id));
        });
      });
    } else {
      this.modem.dial(optsf, function (err, data) {
        if (err) return args.callback(err, data);
        args.callback(err, new Exec(self.modem, data.Id));
      });
    }
  };

  /**
   * Commit
   * @param  {Object}   opts     Commit options like 'Hostname' (optional)
   * @param  {Function} callback Callback
   */
  async commit(opts, callback) {
    var self = this;
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

    if (args.callback === undefined) {
      return new this.modem.Promise(function (resolve, reject) {
        self.modem.dial(optsf, function (err, data) {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    } else {
      this.modem.dial(optsf, function (err, data) {
        args.callback(err, data);
      });
    }
  };

  /**
   * Stop
   * @param  {Object}   opts     Container stop options, like 't' (optional)
   * @param  {Function} callback Callback
   */
  async stop(opts, callback) {
    var self = this;
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

    if (args.callback === undefined) {
      return new this.modem.Promise(function (resolve, reject) {
        self.modem.dial(optsf, function (err, data) {
          if (err) {
            return reject(err);
          }
          self.output = data;
          resolve(self);
        });
      });
    } else {
      this.modem.dial(optsf, function (err, data) {
        args.callback(err, data);
      });
    }
  };

  /**
   * Restart
   * @param  {Object}   opts     Container restart options, like 't' (optional)
   * @param  {Function} callback Callback
   */
  async restart(opts, callback) {
    var self = this;
    var args = util.processArgs(opts, callback, this.defaultOptions.restart);

    var optsf = {
      path: '/containers/' + this.id + '/restart?',
      method: 'POST',
      statusCodes: {
        200: true, // unofficial, but proxies may return it
        204: true,
        404: 'no such container',
        500: 'server error'
      },
      options: args.opts
    };

    if (args.callback === undefined) {
      return new this.modem.Promise(function (resolve, reject) {
        self.modem.dial(optsf, function (err, data) {
          if (err) {
            return reject(err);
          }
          self.output = data;
          resolve(self);
        });
      });
    } else {
      this.modem.dial(optsf, function (err, data) {
        args.callback(err, data);
      });
    }
  };

  /**
   * Kill
   * @param  {Object}   opts     Container kill options, like 'signal' (optional)
   * @param  {Function} callback Callback
   */
  async kill(opts, callback) {
    var self = this;
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

    if (args.callback === undefined) {
      return new this.modem.Promise(function (resolve, reject) {
        self.modem.dial(optsf, function (err, data) {
          if (err) {
            return reject(err);
          }
          self.output = data;
          resolve(self);
        });
      });
    } else {
      this.modem.dial(optsf, function (err, data) {
        args.callback(err, data);
      });
    }
  };

  /**
   * Container resize
   * @param  {[type]}   opts     Resize options. (optional)
   * @param  {Function} callback Callback
   */
  async resize(opts, callback) {
    var self = this;
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

    if (args.callback === undefined) {
      return new this.modem.Promise(function (resolve, reject) {
        self.modem.dial(optsf, function (err, data) {
          if (err) {
            return reject(err);
          }
          self.output = data;
          resolve(self);
        });
      });
    } else {
      this.modem.dial(optsf, function (err, data) {
        args.callback(err, data);
      });
    }
  };

  /**
   * Attach
   * @param  {Object}   opts     Attach options, like 'logs' (optional)
   * @param  {Function} callback Callback with stream.
   */
  async attach(opts, callback) {
    var self = this;
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

    if (args.callback === undefined) {
      return new this.modem.Promise(function (resolve, reject) {
        self.modem.dial(optsf, function (err, stream) {
          if (err) {
            return reject(err);
          }
          resolve(stream);
        });
      });
    } else {
      this.modem.dial(optsf, function (err, stream) {
        args.callback(err, stream);
      });
    }
  };

  /**
   * Waits for a container to end.
   * @param  {Function} callback Callback
   */
  async wait(callback) {
    var self = this;
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

    if (callback === undefined) {
      return new this.modem.Promise(function (resolve, reject) {
        self.modem.dial(optsf, function (err, data) {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    } else {
      this.modem.dial(optsf, function (err, data) {
        callback(err, data);
      });
    }
  };

  /**
   * Removes a container
   * @param  {Object}   opts     Remove options, like 'force' (optional)
   * @param  {Function} callback Callback
   */
  async remove(opts, callback) {
    var self = this;
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

    if (args.callback === undefined) {
      return new this.modem.Promise(function (resolve, reject) {
        self.modem.dial(optsf, function (err, data) {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    } else {
      this.modem.dial(optsf, function (err, data) {
        args.callback(err, data);
      });
    }
  };

  /**
   * Copy (WARNING: DEPRECATED since RAPI v1.20)
   * @param  {Object}   opts     Copy options, like 'Resource' (optional)
   * @param  {Function} callback Callback with stream.
   */
  async copy(opts, callback) {
    var self = this;
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

    if (args.callback === undefined) {
      return new this.modem.Promise(function (resolve, reject) {
        self.modem.dial(optsf, function (err, data) {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    } else {
      this.modem.dial(optsf, function (err, data) {
        args.callback(err, data);
      });
    }
  };

  /**
   * getArchive
   * @param  {Object}   opts     Archive options, like 'path'
   * @param  {Function} callback Callback with stream.
   */
  async getArchive(opts, callback) {
    var self = this;
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

    if (args.callback === undefined) {
      return new this.modem.Promise(function (resolve, reject) {
        self.modem.dial(optsf, function (err, data) {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    } else {
      this.modem.dial(optsf, function (err, data) {
        args.callback(err, data);
      });
    }
  };

  /**
   * infoArchive
   * @param  {Object}   opts     Archive options, like 'path'
   * @param  {Function} callback Callback with stream.
   */
  async infoArchive(opts, callback) {
    var self = this;
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

    if (args.callback === undefined) {
      return new this.modem.Promise(function (resolve, reject) {
        self.modem.dial(optsf, function (err, data) {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    } else {
      this.modem.dial(optsf, function (err, data) {
        args.callback(err, data);
      });
    }
  };

  /**
   * putArchive
   * @param  {Object}   opts     Archive options, like 'path'
   * @param  {Function} callback Callback with stream.
   */
  async putArchive(file, opts, callback) {
    var self = this;
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

    if (args.callback === undefined) {
      return new this.modem.Promise(function (resolve, reject) {
        self.modem.dial(optsf, function (err, data) {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    } else {
      this.modem.dial(optsf, function (err, data) {
        args.callback(err, data);
      });
    }
  };

  /**
   * Container logs
   * @param  {Object}   opts     Logs options. (optional)
   * @param  {Function} callback Callback with data
   */
  async logs(opts, callback) {
    var self = this;
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

    if (args.callback === undefined) {
      return new this.modem.Promise(function (resolve, reject) {
        self.modem.dial(optsf, function (err, data) {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    } else {
      this.modem.dial(optsf, function (err, data) {
        args.callback(err, data);
      });
    }
  };

  /**
   * Container stats
   * @param  {Object}   opts     Stats options. (optional)
   * @param  {Function} callback Callback with data
   */
  async stats(opts, callback) {
    var self = this;
    var args = util.processArgs(opts, callback, this.defaultOptions.stats);
    var isStream = true;
    if (args.opts.stream === false) {
      isStream = false;
    }
    var optsf = {
      path: '/containers/' + this.id + '/stats?',
      method: 'GET',
      isStream: isStream,
      statusCodes: {
        200: true,
        404: 'no such container',
        500: 'server error'
      },
      options: args.opts
    };

    if (args.callback === undefined) {
      return new this.modem.Promise(function (resolve, reject) {
        self.modem.dial(optsf, function (err, data) {
          if (err) {
            return reject(err);
          }
          resolve(data);
        });
      });
    } else {
      this.modem.dial(optsf, function (err, data) {
        args.callback(err, data);
      });
    }
  };

}


module.exports = Container;