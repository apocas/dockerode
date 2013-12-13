var WebSocket = require('ws');

var Container = function(modem, id) {
  this.modem = modem;
  this.id = id;
};

Container.prototype.inspect = function(callback) {
  if (typeof callback === 'function') {
    var opts = {
      path: '/containers/' + this.id + '/json',
      method: 'GET',
      statusCodes: {
        200: true,
        404: "no such container",
        500: "server error"
      }
    };

    this.modem.dial(opts, function(err, data) {
      callback(err, data);
    });
  } else {
    return JSON.stringify({id: this.id});
  }
};

Container.prototype.top = function(opts, callback) {
  if (!callback && typeof(opts) === 'function') {
    callback = opts;
    opts = null;
  }
  
  var opts = {
    path: '/containers/' + this.id + '/top?',
    method: 'GET',
    statusCodes: {
      200: true,
      404: "no such container",
      500: "server error"
    },
    options: opts
  };

  this.modem.dial(opts, function(err, data) {
    callback(err, data);
  });
};

Container.prototype.changes = function(callback) {
  var opts = {
    path: '/containers/' + this.id + '/changes',
    method: 'GET',
    statusCodes: {
      200: true,
      404: "no such container",
      500: "server error"
    }
  };

  this.modem.dial(opts, function(err, data) {
    callback(err, data);
  });
};

Container.prototype.export = function(callback) {
  var opts = {
    path: '/containers/' + this.id + '/export',
    method: 'GET',
    isStream: true,
    statusCodes: {
      200: true,
      404: "no such container",
      500: "server error"
    }
  };

  this.modem.dial(opts, function(err, data) {
    callback(err, data);
  });
};

Container.prototype.start = function(opts, callback) {
  if (!callback && typeof(opts) === 'function') {
    callback = opts;
    opts = null;
  }

  var optsf = {
    path: '/containers/' + this.id + '/start',
    method: 'POST',
    statusCodes: {
      204: true,
      404: "no such container",
      500: "server error"
    },
    options: opts
  };

  this.modem.dial(optsf, function(err, data) {
    callback(err, data);
  });
};

Container.prototype.commit = function(opts, callback) {
  if (!callback && typeof(opts) === 'function') {
    callback = opts;
    opts = {};
  }

  opts.container = this.id;

  var optsf = {
    path: '/commit?',
    method: 'POST',
    statusCodes: {
      201: true,
      404: "no such container",
      500: "server error"
    },
    options: opts
  };

  this.modem.dial(optsf, function(err, data) {
    callback(err, data);
  });
};

Container.prototype.stop = function(opts, callback) {
  if (!callback && typeof(opts) === 'function') {
    callback = opts;
    opts = null;
  }

  var optsf = {
    path: '/containers/' + this.id + '/stop?',
    method: 'POST',
    statusCodes: {
      204: true,
      404: "no such container",
      500: "server error"
    },
    options: opts
  };

  this.modem.dial(optsf, function(err, data) {
    callback(err, data);
  });
};

Container.prototype.restart = function(callback) {
  var opts = {
    path: '/containers/' + this.id + '/restart',
    method: 'POST',
    statusCodes: {
      204: true,
      404: "no such container",
      500: "server error"
    }
  };

  this.modem.dial(opts, function(err, data) {
    callback(err, data);
  });
};

Container.prototype.kill = function(callback) {
  var opts = {
    path: '/containers/' + this.id + '/kill',
    method: 'POST',
    statusCodes: {
      204: true,
      404: "no such container",
      500: "server error"
    }
  };

  this.modem.dial(opts, function(err, data) {
    callback(err, data);
  });
};

Container.prototype.attach = function(opts, callback, ws) {
  if(ws) {
    var ws = new WebSocket('ws+unix://' + this.modem.socketPath);
    ws.on('message', function(data, flags) {
      console.log(data);
    });
  } else {
    var optsf = {
      path: '/containers/' + this.id + '/attach?',
      method: 'POST',
      options: opts,
      isStream: true,
      statusCodes: {
        200: true,
        404: "no such container",
        500: "server error"
      }
    };

    this.modem.dial(optsf, function(err, data) {
      callback(err, data);
    });
  }
};

Container.prototype.wait = function(callback) {
  var opts = {
    path: '/containers/' + this.id + '/wait',
    method: 'POST',
    statusCodes: {
      200: true,
      400: 'bad parameter',
      404: 'no such container',
      500: "server error"
    }
  };

  this.modem.dial(opts, function(err, data) {
    callback(err, data);
  });
};

Container.prototype.remove = function(callback) {
  var opts = {
    path: '/containers/' + this.id,
    method: 'DELETE',
    statusCodes: {
      204: true,
      400: 'bad parameter',
      404: "no such container",
      500: "server error"
    }
  };

  this.modem.dial(opts, function(err, data) {
    callback(err, data);
  });
};

Container.prototype.copy = function(callback) {
  var opts = {
    path: '/containers/' + this.id + '/copy',
    method: 'POST',
    isStream: true,
    statusCodes: {
      200: true,
      404: "no such container",
      500: "server error"
    }
  };

  this.modem.dial(opts, function(err, data) {
    callback(err, data);
  });
};

module.exports = Container;
