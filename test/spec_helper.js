var Docker = require('../lib/docker');
var fs     = require('fs');

// For Mac OS X:
// socat -d -d unix-l:/tmp/docker.sock,fork tcp:<docker-host>:4243
// DOCKER_SOCKET=/tmp/docker.sock npm test

var socket = process.env.DOCKER_SOCKET || '/var/run/docker.sock';
var stats  = fs.statSync(socket);
if (!stats.isSocket()) {
  throw new Error("Are you sure the docker is running?");
}

module.exports = {
  docker: new Docker({ socketPath: socket })
};
