var EventEmitter = require('events').EventEmitter,
  Modem = require('docker-modem'),
  Container = require('./container'),
  Image = require('./image'),
  Volume = require('./volume'),
  Network = require('./network'),
  Service = require('./service'),
  Task = require('./task'),
  Node = require('./node'),
  Exec = require('./exec'),
  util = require('./util'),
  extend = util.extend;

var Docker = function(opts) {
  if (!(this instanceof Docker)) return new Docker(opts);
  this.modem = new Modem(opts);
};

/**
 * Creates a new container
 * @param {Object}   opts     Create options
 * @param {Function} callback Callback
 */
Docker.prototype.createContainer = function(opts, callback) {
  var self = this;
  var optsf = {
    path: '/containers/create?',
    method: 'POST',
    options: opts,
    statusCodes: {
      200: true, // unofficial, but proxies may return it
      201: true,
      404: 'no such container',
      406: 'impossible to attach',
      500: 'server error'
    }
  };

  this.modem.dial(optsf, function(err, data) {
    if (err) return callback(err, data);
    callback(err, self.getContainer(data.Id));
  });
};

/**
 * Creates a new image
 * @param {Object}   auth     Authentication (optional)
 * @param {Object}   opts     Create options
 * @param {Function} callback Callback
 */
Docker.prototype.createImage = function(auth, opts, callback) {
  if (!callback && typeof opts === 'function') {
    callback = opts;
    opts = auth;
    auth = opts.authconfig || undefined;
  }

  var self = this;
  var optsf = {
    path: '/images/create?',
    method: 'POST',
    options: opts,
    authconfig: auth,
    isStream: true,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  this.modem.dial(optsf, function(err, data) {
    callback(err, data);
  });
};

/**
 * Load image
 * @param {String}   file     File
 * @param {Object}   opts     Options (optional)
 * @param {Function} callback Callback
 */
Docker.prototype.loadImage = function(file, opts, callback) {
  if (!callback && typeof opts === 'function') {
    callback = opts;
    opts = null;
  }

  var self = this;
  var optsf = {
    path: '/images/load?',
    method: 'POST',
    options: opts,
    file: file,
    isStream: true,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  this.modem.dial(optsf, function(err, data) {
    callback(err, data);
  });
};

/**
 * Import image from a tar archive
 * @param {String}   file     File
 * @param {Object}   opts     Options (optional)
 * @param {Function} callback Callback
 */
Docker.prototype.importImage = function(file, opts, callback) {
  if (!callback && typeof opts === 'function') {
    callback = opts;
    opts = {};
  }

  opts.fromSrc = '-';

  var self = this;
  var optsf = {
    path: '/images/create?',
    method: 'POST',
    options: opts,
    file: file,
    isStream: true,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  this.modem.dial(optsf, function(err, data) {
    callback(err, data);
  });
};

/**
 * Verifies auth
 * @param {Object}   opts     Options
 * @param {Function} callback Callback
 */
Docker.prototype.checkAuth = function(opts, callback) {
  var self = this;
  var optsf = {
    path: '/auth',
    method: 'POST',
    options: opts,
    statusCodes: {
      200: true,
      204: true,
      500: 'server error'
    }
  };

  this.modem.dial(optsf, function(err, data) {
    callback(err, data);
  });
};

/**
 * Builds an image
 * @param {String}   file     File
 * @param {Object}   opts     Options (optional)
 * @param {Function} callback Callback
 */
Docker.prototype.buildImage = function(file, opts, callback) {
  if (!callback && typeof opts === 'function') {
    callback = opts;
    opts = null;
  }

  var self = this;
  var optsf = {
    path: '/build?',
    method: 'POST',
    file: file,
    options: opts,
    isStream: true,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  if (opts) {
    if (opts.registryconfig) {
      optsf.registryconfig = optsf.options.registryconfig;
      delete optsf.options.registryconfig;
    }

    //undocumented?
    if (opts.authconfig) {
      optsf.authconfig = optsf.options.authconfig;
      delete optsf.options.authconfig;
    }
  }

  this.modem.dial(optsf, function(err, data) {
    callback(err, data);
  });
};

/**
 * Fetches a Container by ID
 * @param {String} id Container's ID
 */
Docker.prototype.getContainer = function(id) {
  return new Container(this.modem, id);
};

/**
 * Fetches an Image by name
 * @param {String} name Image's name
 */
Docker.prototype.getImage = function(name) {
  return new Image(this.modem, name);
};

/**
 * Fetches a Volume by name
 * @param {String} name Volume's name
 */
Docker.prototype.getVolume = function(name) {
  return new Volume(this.modem, name);
};

/**
 * Fetches a Service by id
 * @param {String} id Services's id
 */
Docker.prototype.getService = function(id) {
  return new Service(this.modem, id);
};

/**
 * Fetches a Task by id
 * @param {String} id Task's id
 */
Docker.prototype.getTask = function(id) {
  return new Task(this.modem, id);
};

/**
 * Fetches Node by id
 * @param {String} id Node's id
 */
Docker.prototype.getNode = function(id) {
  return new Node(this.modem, id);
};

/**
 * Fetches a Network by id
 * @param {String} id network's id
 */
Docker.prototype.getNetwork = function(id) {
  return new Network(this.modem, id);
};

/**
 * Fetches an Exec instance by ID
 * @param {String} id Exec instance's ID
 */
Docker.prototype.getExec = function(id) {
  return new Exec(this.modem, id);
};

/**
 * Lists containers
 * @param {Options}   opts     Options (optional)
 * @param {Function} callback Callback
 */
Docker.prototype.listContainers = function(opts, callback) {
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/containers/json?',
    method: 'GET',
    options: args.opts,
    statusCodes: {
      200: true,
      400: 'bad parameter',
      500: 'server error'
    }
  };

  this.modem.dial(optsf, function(err, data) {
    args.callback(err, data);
  });
};

/**
 * Lists images
 * @param {Options}   opts     Options (optional)
 * @param {Function} callback Callback
 */
Docker.prototype.listImages = function(opts, callback) {
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/images/json?',
    method: 'GET',
    options: args.opts,
    statusCodes: {
      200: true,
      400: 'bad parameter',
      500: 'server error'
    }
  };

  this.modem.dial(optsf, function(err, data) {
    args.callback(err, data);
  });
};

/**
 * Lists Services
 * @param {Function} callback Callback
 */
Docker.prototype.listServices = function(opts, callback) {
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/services?',
    method: 'GET',
    options: args.opts,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  this.modem.dial(optsf, function(err, data) {
    args.callback(err, data);
  });
};

/**
 * Lists Nodes
 * @param {Function} callback Callback
 */
Docker.prototype.listNodes = function(callback) {

  var optsf = {
    path: '/nodes',
    method: 'GET',
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  this.modem.dial(optsf, function(err, data) {
    callback(err, data);
  });
};

/**
 * Lists Tasks
 * @param {Function} callback Callback
 */
Docker.prototype.listTasks = function(opts, callback) {
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/tasks?',
    method: 'GET',
    options: args.opts,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  this.modem.dial(optsf, function(err, data) {
    args.callback(err, data);
  });
};


/**
 * Creates a new volume
 * @param {Object}   opts     Create options
 * @param {Function} callback Callback
 */
Docker.prototype.createVolume = function(opts, callback) {
  var args = util.processArgs(opts, callback);
  var self = this;
  var optsf = {
    path: '/volumes/create?',
    method: 'POST',
    options: args.opts,
    statusCodes: {
      200: true, // unofficial, but proxies may return it
      201: true,
      500: 'server error'
    }
  };

  this.modem.dial(optsf, function(err, data) {
    if (err) return args.callback(err, data);
    args.callback(err, self.getVolume(data.Name));
  });
};

/**
 * Creates a new service
 * @param {Object}   opts     Create options
 * @param {Function} callback Callback
 */
Docker.prototype.createService = function(auth, opts, callback) {
  if (!callback && typeof opts === 'function') {
    callback = opts;
    opts = auth;
    auth = opts.authconfig || undefined;
  }
  var self = this;
  var optsf = {
    path: '/services/create',
    method: 'POST',
    options: opts,
    authconfig: auth,
    statusCodes: {
      200: true,
      201: true,
      500: 'server error'
    }
  };

  this.modem.dial(optsf, function(err, data) {
    if (err) return callback(err, data);

    callback(err, self.getService(data.ID || data.Id));
  });
};

/**
 * Lists volumes
 * @param {Options}   opts     Options (optional)
 * @param {Function} callback Callback
 */
Docker.prototype.listVolumes = function(opts, callback) {
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/volumes?',
    method: 'GET',
    options: args.opts,
    statusCodes: {
      200: true,
      400: 'bad parameter',
      500: 'server error'
    }
  };

  this.modem.dial(optsf, function(err, data) {
    args.callback(err, data);
  });
};

/**
 * Creates a new network
 * @param {Object}   opts     Create options
 * @param {Function} callback Callback
 */
Docker.prototype.createNetwork = function(opts, callback) {
  var args = util.processArgs(opts, callback);
  var self = this;
  var optsf = {
    path: '/networks/create?',
    method: 'POST',
    options: args.opts,
    statusCodes: {
      200: true, // unofficial, but proxies may return it
      201: true,
      404: 'driver not found',
      500: 'server error'
    }
  };

  this.modem.dial(optsf, function(err, data) {
    if (err) return args.callback(err, data);
    args.callback(err, self.getNetwork(data.Id));
  });
};

/**
 * Lists networkss
 * @param {Options}   opts     Options (optional)
 * @param {Function} callback Callback
 */
Docker.prototype.listNetworks = function(opts, callback) {
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/networks?',
    method: 'GET',
    options: args.opts,
    statusCodes: {
      200: true,
      400: 'bad parameter',
      500: 'server error'
    }
  };

  this.modem.dial(optsf, function(err, data) {
    args.callback(err, data);
  });
};

/**
 * Search images
 * @param {Object}   opts     Options
 * @param {Function} callback Callback
 */
Docker.prototype.searchImages = function(opts, callback) {
  var optsf = {
    path: '/images/search?',
    method: 'GET',
    options: opts,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  this.modem.dial(optsf, function(err, data) {
    callback(err, data);
  });
};

/**
 * Info
 * @param  {Function} callback Callback with info
 */
Docker.prototype.info = function(callback) {
  var opts = {
    path: '/info',
    method: 'GET',
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  this.modem.dial(opts, function(err, data) {
    callback(err, data);
  });
};

/**
 * Version
 * @param  {Function} callback Callback
 */
Docker.prototype.version = function(callback) {
  var opts = {
    path: '/version',
    method: 'GET',
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  this.modem.dial(opts, function(err, data) {
    callback(err, data);
  });
};

/**
 * Ping
 * @param  {Function} callback Callback
 */
Docker.prototype.ping = function(callback) {
  var optsf = {
    path: '/_ping',
    method: 'GET',
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  this.modem.dial(optsf, function(err, data) {
    callback(err, data);
  });
};

/**
 * Events
 * @param {Object}   opts     Events options, like 'since' (optional)
 * @param {Function} callback Callback
 */
Docker.prototype.getEvents = function(opts, callback) {
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/events?',
    method: 'GET',
    options: args.opts,
    isStream: true,
    statusCodes: {
      200: true,
      500: 'server error'
    }
  };

  this.modem.dial(optsf, function(err, data) {
    args.callback(err, data);
  });
};

/**
 * Pull is a wrapper around parsing out the tag from the image
 * (which create image cannot do but run can for whatever reasons) and create image overloading.
 * @param  {String}   repoTag  Repository tag
 * @param  {Object}   opts     Options (optional)
 * @param  {Function} callback Callback
 * @param  {Object}   auth     Authentication (optional)
 * @return {Object}            Image
 */
Docker.prototype.pull = function(repoTag, opts, callback, auth) {
  var args = util.processArgs(opts, callback);

  var imageSrc = util.parseRepositoryTag(repoTag);
  args.opts.fromImage = imageSrc.repository;
  args.opts.tag = imageSrc.tag;

  var argsf = [args.opts, args.callback];
  if (auth) {
    argsf = [auth, args.opts, args.callback];
  }
  return this.createImage.apply(this, argsf);
};

/**
 * Like run command from Docker's CLI
 * @param  {String}   image         Image name to be used.
 * @param  {Array}   cmd           Command to run in array format.
 * @param  {Object}   streamo       Output stream
 * @param  {Object}   createOptions Container create options (optional)
 * @param  {Object}   startOptions  Container start options (optional)
 * @param  {Function} callback      Callback
 * @return {Object}                 EventEmitter
 */
Docker.prototype.run = function(image, cmd, streamo, createOptions, startOptions, callback) {
  if (!callback && typeof createOptions === 'function') {
    callback = createOptions;
    createOptions = {};
    startOptions = {};
  } else if (!callback && typeof startOptions === 'function') {
    callback = startOptions;
    startOptions = {};
  }

  var hub = new EventEmitter();

  function handler(err, container) {
    if (err) return callback(err, null, container);

    hub.emit('container', container);

    container.attach({
      stream: true,
      stdout: true,
      stderr: true
    }, function handler(err, stream) {
      if (err) return callback(err, null, container);

      hub.emit('stream', stream);

      if (streamo) {
        if (streamo instanceof Array) {
          stream.on('end', function() {
            try {
              streamo[0].end();
            } catch (e) {}
            try {
              streamo[1].end();
            } catch (e) {}
          });
          container.modem.demuxStream(stream, streamo[0], streamo[1]);
        } else {
          stream.setEncoding('utf8');
          stream.pipe(streamo, {
            end: true
          });
        }
      }

      container.start(startOptions, function(err, data) {
        if (err) return callback(err, data, container);
        hub.emit('start', container);

        container.wait(function(err, data) {
          hub.emit('data', data);
          callback(err, data, container);
        });
      });
    });
  }

  var optsc = {
    'Hostname': '',
    'User': '',
    'AttachStdin': false,
    'AttachStdout': true,
    'AttachStderr': true,
    'Tty': true,
    'OpenStdin': false,
    'StdinOnce': false,
    'Env': null,
    'Cmd': cmd,
    'Image': image,
    'Volumes': {},
    'VolumesFrom': []
  };

  extend(optsc, createOptions);

  this.createContainer(optsc, handler);

  return hub;
};

/**
 * Init swarm.
 *
 * @param {object} options
 * @param {function} callback
 */
Docker.prototype.swarmInit = function(opts, callback) {
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/swarm/init',
    method: 'POST',
    statusCodes: {
      200: true,
      400: 'bad parameter',
      406: 'node is already part of a Swarm'
    },
    options: args.opts
  };

  this.modem.dial(optsf, function(err, data) {
    args.callback(err, data);
  });
};

/**
 * Join swarm.
 *
 * @param {object} options
 * @param {function} callback
 */
Docker.prototype.swarmJoin = function(opts, callback) {
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/swarm/join',
    method: 'POST',
    statusCodes: {
      200: true,
      400: 'bad parameter',
      406: 'node is already part of a Swarm'
    },
    options: args.opts
  };

  this.modem.dial(optsf, function(err, data) {
    args.callback(err, data);
  });
};

/**
 * Leave swarm.
 *
 * @param {function} callback
 */
Docker.prototype.swarmLeave = function(opts, callback) {
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/swarm/leave?',
    method: 'POST',
    statusCodes: {
      200: true,
      406: 'node is not part of a Swarm'
    },
    options: args.opts
  };

  this.modem.dial(optsf, function(err, data) {
    args.callback(err, data);
  });
};

/**
 * Update swarm.
 *
 * @param {function} callback
 */
Docker.prototype.swarmUpdate = function(opts, callback) {
  var args = util.processArgs(opts, callback);

  var optsf = {
    path: '/swarm/update?',
    method: 'POST',
    statusCodes: {
      200: true,
      400: 'bad parameter',
      406: 'node is already part of a Swarm'
    },
    options: args.opts
  };

  this.modem.dial(optsf, function(err, data) {
    args.callback(err, data);
  });
};


/**
 * Inspect a Swarm.
 * Warning: This method is not documented in the API
 *
 * @param  {Function} callback Callback
 */
Docker.prototype.swarmInspect = function(callback) {
  var optsf = {
    path: '/swarm',
    method: 'GET',
    statusCodes: {
      200: true,
      406: 'This node is not a swarm manager',
      500: 'server error'
    }
  };

  this.modem.dial(optsf, function(err, data) {
    callback(err, data);
  });
};

module.exports = Docker;
