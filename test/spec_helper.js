var http = require("http");
http.globalAgent.maxSockets = 1000;

var Docker = require('../lib/docker');
var fs     = require('fs');

// For Mac OS X:
// socat -d -d unix-l:/tmp/docker.sock,fork tcp:<docker-host>:4243
// DOCKER_SOCKET=/tmp/docker.sock npm test

var socket   = process.env.DOCKER_SOCKET || '/var/run/docker.sock';
var isSocket = fs.existsSync(socket) ? fs.statSync(socket).isSocket() : false;
var docker;

if (!isSocket) {
  console.log('Trying TCP connection...');
  docker = new Docker();
  dockert = new Docker({timeout: 1});
} else {
  docker = new Docker({ socketPath: socket });
  dockert = new Docker({ socketPath: socket, timeout: 1 });
}

module.exports = {
  'docker': docker,
  'dockert': dockert
};
