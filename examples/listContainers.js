var Docker = require('../lib/docker');
var fs     = require('fs');

var socket = process.env.DOCKER_SOCKET || '/var/run/docker.sock';
var stats  = fs.statSync(socket);

if (!stats.isSocket()) {
  throw new Error('Are you sure the docker is running?');
}

var docker = new Docker({ socketPath: socket });

docker.listContainers({all: true}, function(err, containers) {
  console.log('ALL: ' + containers.length);
});

docker.listContainers({all: false}, function(err, containers) {
  console.log('!ALL: ' + containers.length);
});
