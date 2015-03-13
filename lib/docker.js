var EventEmitter = require('events').EventEmitter,
  Modem = require('docker-modem'),
  Container = require('./container'),
  Image = require('./image'),
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
      201: true,
      404: "no such container",
      406: 'impossible to attach',
      500: "server error"
    }
  };

  this.modem.dial(optsf, function(err, data) {
    if(err) return callback(err, data);
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
    auth = undefined;
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
      500: "server error"
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
    statusCodes: {
      200: true,
      500: "server error"
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
  var opts = {
    path: '/auth',
    method: 'POST',
    options: opts,
    statusCodes: {
      200: true,
      204: true,
      500: "server error"
    }
  };

  this.modem.dial(opts, function(err, data) {
    callback(err, data);
  });
};

/**
 * Buils an image
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
  var opts = {
    path: '/build?',
    method: 'POST',
    file: file,
    options: opts,
    isStream: true,
    statusCodes: {
      200: true,
      500: "server error"
    }
  };

  this.modem.dial(opts, function(err, data) {
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
 * Lists containers
 * @param {Options}   opts     Options (optional)
 * @param {Function} callback Callback
 */
Docker.prototype.listContainers = function(opts, callback) {
  var self = this;

  if (!callback && typeof opts === 'function') {
    callback = opts;
    opts = null;
  }

  var optsf = {
    path: '/containers/json?',
    method: 'GET',
    options: opts,
    statusCodes: {
      200: true,
      400: "bad parameter",
      500: "server error"
    }
  };

  this.modem.dial(optsf, function(err, data) {
    callback(err, data);
  });
};

/**
 * Lists images
 * @param {Options}   opts     Options (optional)
 * @param {Function} callback Callback
 */
Docker.prototype.listImages = function(opts, callback) {
  if (!callback && typeof opts === 'function') {
    callback = opts;
    opts = null;
  }

  var opts = {
    path: '/images/json?',
    method: 'GET',
    options: opts,
    statusCodes: {
      200: true,
      400: "bad parameter",
      500: "server error"
    }
  };

  this.modem.dial(opts, function(err, data) {
    callback(err, data);
  });
};

/**
 * Search images
 * @param {Object}   opts     Options
 * @param {Function} callback Callback
 */
Docker.prototype.searchImages = function(opts, callback) {
  var opts = {
    path: '/images/search?',
    method: 'GET',
    options: opts,
    statusCodes: {
      200: true,
      500: "server error"
    }
  };

  this.modem.dial(opts, function(err, data) {
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
      500: "server error"
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
      500: "server error"
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
  if (!callback && typeof opts === 'function') {
    callback = opts;
    opts = null;
  }

  var optsf = {
    path: '/_ping',
    method: 'GET',
    statusCodes: {
      200: true,
      500: "server error"
    }
  };

  this.modem.dial(optsf, function(err, data) {
    callback(err, data);
  });
};

/**
 * Events
 * @param {Object}   opts     Events options, like "since" (optional)
 * @param {Function} callback Callback
 */
Docker.prototype.getEvents = function(opts, callback) {
  if (!callback && typeof opts === 'function') {
    callback = opts;
    opts = null;
  }

  var optsf = {
    path: '/events?',
    method: 'GET',
    options: opts,
    isStream: true,
    statusCodes: {
      200: true,
      500: "server error"
    }
  };

  this.modem.dial(optsf, function(err, data) {
    callback(err, data);
  });
};

/**
 * Pull is a wrapper around parsing out the tag from the image
 * (which create image cannot do but run can for whatever reasons) and create image overloading.
 * @param  {String}   repoTag  Repository tag
 * @param  {Object}   opts     Options (optional)
 * @param  {Function} callback Callback
 * @return {Object}            Image
 */
Docker.prototype.pull = function(repoTag, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }
  var authconfig = opts.authconfig || false;
  delete opts.authconfig;

  var imageSrc = util.parseRepositoryTag(repoTag);
  var pullOpts = {
    fromImage: imageSrc.repository,
    tag: imageSrc.tag
  };

  // allow overriding the pull opts
  extend(pullOpts, opts);

  var args = [pullOpts, callback];
  // Remove authconfig if set
  if (authconfig) {
    args.unshift(authconfig);
  }
  return this.createImage.apply(this, args);
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
    if (err) return callback(err, container);

    hub.emit('container', container);

    container.attach({stream: true, stdout: true, stderr: true}, function handler(err, stream) {
      if (err) return callback(err, data);

      hub.emit('stream', stream);

      if (streamo) {
        if (streamo instanceof Array) {
          stream.on('end', function () {
            try { streamo[0].end(); } catch (e) {}
            try { streamo[1].end(); } catch (e) {}
          });
          container.modem.demuxStream(stream, streamo[0], streamo[1]);
        } else {
          stream.setEncoding('utf8');
          stream.pipe(streamo, {end: true});
        }
      }

      container.start(startOptions, function(err, data) {
        if(err) return callback(err, data);

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
    'VolumesFrom': ''
  };

  extend(optsc, createOptions);

  this.createContainer(optsc, handler);

  return hub;
};

module.exports = Docker;
