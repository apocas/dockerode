var querystring = require('querystring'),
    http = require('follow-redirects').http,
    fs = require('fs'),
    p = require('path'),
    url = require('url');


var Modem = function(opts) {
  this.socketPath = opts.socketPath;
  this.host = opts.host;
  this.port = opts.port;
};


Modem.prototype.dial = function(options, callback) {
  var opts, url, data;
  var self = this;

  if (options.options) {
    opts = options.options;
  }

  if(this.host) {
    url = url.resolve(this.host, options.path);
  } else {
    url = options.path;
  }


  if(options.path.indexOf('?') !== -1) {
    if (opts && Object.keys(opts).length > 0) {
      url += querystring.stringify(opts);
    } else {
      url = url.substring(0, url.length - 1);
    }
  }

  var optionsf = {
    path: url,
    method: options.method
  };

  if(options.file) {
    data = fs.readFileSync(p.resolve(options.file));
    optionsf.headers = {
      'Content-Type': 'application/tar',
      'Content-Length': data.length
    };
  } else if(opts && options.method === 'POST') {
    data = JSON.stringify(opts);
  }

  if(this.socketPath) {
    optionsf.socketPath = this.socketPath;
  } else {
    optionsf.hostname = url.parse(options.path).hostname;
    optionsf.port = url.parse(options.path).port;
  }

  //console.log(optionsf);

  var req = http.request(optionsf, function() {});

  req.on('response', function(res) {
    if (options.isStream) {
      res.setEncoding('utf8');
      self.buildPayload(null, options.isStream, options.statusCodes, res, null, callback);
    } else {
      var chunks = '';
      res.on('data', function(chunk) {
        chunks += chunk;
      });

      res.on('end', function() {
        var json;
        try {
          json = JSON.parse(chunks);
        } catch(e) {
          json = chunks.split(/\n/);
        }
        self.buildPayload(null, options.isStream, options.statusCodes, res, json, callback);
      });
    }
  });

  req.on('error', function(error) {
    self.buildPayload(error, options.isStream, options.statusCodes, {}, null, callback);
  });

  if(data) {
    req.write(data);
  }
  req.end();
};


Modem.prototype.buildPayload = function(err, isStream, statusCodes, res, json, cb) {
  if (err) cb(err, null);

  if (typeof json === 'string' && !json.isJson()) {
    json = '{"msg": "' + json.replace(/[^a-zA-Z ]/g, "") + '"}';
  } else if (typeof json === 'string') {
    json = JSON.parse(json);
  }

  //console.log(json);

  if (statusCodes[res.statusCode] !== true) {
    var msg = 'HTTP response code is ' + res.statusCode + ' which indicates an error: ' + statusCodes[res.statusCode];
    cb(msg, json);
  } else {
    if (isStream) {
      cb(null, res);
    } else {
      cb(null, json);
    }
  }
};


module.exports = Modem;