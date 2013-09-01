var Modem = require('./modem'),
  Container = require('./container'),
  Image = require('./image');

var Docker = function(opts) {
  this.modem = new Modem(opts);
};

Docker.prototype.createContainer = function(opts, callback) {
  var self = this;
  var opts = {
    path: '/containers/create',
    method: 'POST',
    options: opts,
    statusCodes: {
      201: true,
      404: "no such container",
      406: 'impossible to attach',
      500: "server error"
    }
  };

  this.modem.dial(opts, function(err, data) {
    callback(err, new Container(self.modem, data.Id));
  });
};

Docker.prototype.createImage = function(opts, callback) {
  var self = this;
  var opts = {
    path: '/images/create?',
    method: 'POST',
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
  var opts = {
    path: '/containers/json?',
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

Docker.prototype.listImages = function(opts, callback) {
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
  var opts = {
    path: '/events?',
    method: 'GET',
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

Docker.prototype.run = function(image, cmd, streamo, temporary, callback) {

  function handler(err, container) {
    container.attach({stream: true, stdout: true, stderr: true}, function handler(err, stream) {
      if(err) callback(err, data);
      
      if(streamo) {
        stream.pipe(streamo, {end: false});
      }

      container.wait(function(err, data) {
        callback(err, data);
        if(temporary === true) {
          container.remove(function(err, data){});
        }
      });

      container.start(function(err, data) {
        if(err) callback(err, data);
      });
    });
  }

  var optsc = {
    'Hostname': '',
    'User': '',
    'AttachStdin': false,
    'AttachStdout': true,
    'AttachStderr': true,
    'Tty': false,
    'OpenStdin': false,
    'StdinOnce': false,
    'Env': null,
    'Cmd': ['bash', '-c', cmd],
    'Dns': ['8.8.8.8', '8.8.4.4'],
    'Image': image,
    'Volumes': {},
    'VolumesFrom': ''
  };

  this.createContainer(optsc, handler);
};

module.exports = Docker;