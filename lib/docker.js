var EventEmitter = require('events').EventEmitter,
  Modem = require('docker-modem'),
  Container = require('./container'),
  Image = require('./image'),
  util = require('./util'),
  _ = require('underscore');

var Docker = function(opts) {
  if (!(this instanceof Docker)) return new Docker(opts);
  this.modem = new Modem(opts);
};

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

Docker.prototype.createImage = function(auth, opts, callback) {
  if (!callback && typeof(opts) === 'function') {
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

Docker.prototype.buildImage = function(file, opts, callback) {
  if (!callback && typeof(opts) === 'function') {
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

Docker.prototype.getContainer = function(id) {
  return new Container(this.modem, id);
};

Docker.prototype.getImage = function(name) {
  return new Image(this.modem, name);
};

Docker.prototype.listContainers = function(opts, callback) {
  var self = this;

  if (!callback && typeof(opts) === 'function') {
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

Docker.prototype.listImages = function(opts, callback) {
  if (!callback && typeof(opts) === 'function') {
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

Docker.prototype.getEvents = function(opts, callback) {
  if (!callback && typeof(opts) === 'function') {
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
Pull is a wrapper around parsing out the tag from the image
(which create image cannot do but run can for whatever reasons) and create image overloading.
*/
Docker.prototype.pull = function(repoTag, opts, callback) {
  if (typeof opts === 'function') {
    callback = opts;
    opts = {};
  }

  var imageSrc = util.parseRepositoryTag(repoTag);
  var pullOpts = {
    fromImage: imageSrc.repository,
    tag: imageSrc.tag
  };

  // allow overriding the pull opts
  for (var key in opts) pullOpts[key] = opts[key];

  // XXX: Should we allow authopts here?
  return this.createImage(pullOpts, callback);
};

Docker.prototype.run = function(image, cmd, streamo, options, callback) {
  if (!callback && typeof(options) === 'function') {
    callback = options;
    options = {};
  }
  
  var hub = new EventEmitter();

  function handler(err, container) {
    if (err) return callback(err, container);
    
    hub.emit('container', container);

    container.attach({stream: true, stdout: true, stderr: true}, function handler(err, stream) {
      if(err) return callback(err, data);

      hub.emit('stream', stream);

      if(streamo) {
        stream.setEncoding('utf8');
        stream.pipe(streamo, {end: true});
      }

      container.start(function(err, data) {
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

  _.extend(optsc, options);

  this.createContainer(optsc, handler);
  
  return hub;
};

module.exports = Docker;
