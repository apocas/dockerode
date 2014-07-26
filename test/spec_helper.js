var Docker = require('../lib/docker');
var fs     = require('fs');

// For Mac OS X:
// socat -d -d unix-l:/tmp/docker.sock,fork tcp:<docker-host>:4243
// DOCKER_SOCKET=/tmp/docker.sock npm test


var socket = process.env.DOCKER_SOCKET || '/var/run/docker.sock';
var stats  = fs.statSync(socket);
var docker;

if (!stats.isSocket()) {
  console.log('Trying TCP connection...');
  docker = new Docker({host: process.env.DOCKER_HOST || 'http://127.0.0.1', port: process.env.DOCKER_PORT || 3000});
} else {
  docker = new Docker({ socketPath: socket });
}

module.exports = {
  'docker': docker
};
