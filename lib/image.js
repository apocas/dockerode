var Image = function(modem, name) {
  this.modem = modem;
  this.name = name;
};

Image.prototype.insert = function(opts, callback) {
  var self = this;
  var opts = {
    path: '/images/' + this.name + '/insert?',
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

Image.prototype.inspect = function(callback) {
  var opts = {
    path: '/images/' + this.name + '/json',
    method: 'GET',
    statusCodes: {
      200: true,
      404: "no such image",
      500: "server error"
    }
  };

  this.modem.dial(opts, function(err, data) {
    callback(err, data);
  });
};

Image.prototype.history = function(callback) {
  var opts = {
    path: '/images/' + this.name + '/history',
    method: 'GET',
    statusCodes: {
      200: true,
      404: "no such image",
      500: "server error"
    }
  };

  this.modem.dial(opts, function(err, data) {
    callback(err, data);
  });
};

Image.prototype.push = function(opts, callback, auth) {
  var self = this;
  var opts = {
    path: '/images/' + this.name + '/push?',
    method: 'POST',
    options: opts,
    authconfig: auth,
    isStream: true,
    statusCodes: {
      200: true,
      404: "no such image",
      500: "server error"
    }
  };

  this.modem.dial(opts, function(err, data) {
    callback(err, data);
  });
};

Image.prototype.tag = function(opts, callback) {
  var self = this;
  var opts = {
    path: '/images/' + this.name + '/tag?',
    method: 'POST',
    options: opts,
    isStream: true,
    statusCodes: {
      200: true,
      404: "bad parameter",
      404: "no such image",
      409: "conflict",
      500: "server error"
    }
  };

  this.modem.dial(opts, function(err, data) {
    callback(err, data);
  });
};

Image.prototype.remove = function(callback) {
  var opts = {
    path: '/images/' + this.name,
    method: 'DELETE',
    statusCodes: {
      200: true,
      404: "no such image",
      409: "conflict",
      500: "server error"
    }
  };

  this.modem.dial(opts, function(err, data) {
    callback(err, data);
  });
};

module.exports = Image;