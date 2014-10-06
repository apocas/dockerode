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
  docker = new Docker({host: process.env.DOCKER_HOST || 'http://127.0.0.1', port: process.env.DOCKER_PORT || 3000});
  dockert = new Docker({host: process.env.DOCKER_HOST || 'http://127.0.0.1', port: process.env.DOCKER_PORT || 3000, timeout: 1});
} else {
  docker = new Docker({ socketPath: socket });
  dockert = new Docker({ socketPath: socket, timeout: 1 });
}

module.exports = {
  'docker': docker,
  'dockert': dockert
};
