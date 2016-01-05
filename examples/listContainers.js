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

// filter by labels
var opts = {
  "limit": 3,
  "filters": '{"label": ["staging","env=green"]}'
};

// maps are also supported (** requires docker-modem 0.3+ **)
opts["filters"] = {
  "label": [
    "staging",
    "env=green"
  ]
};

docker.listContainers(opts, function(err, containers) {
  console.log('Containers labeled staging + env=green : ' + containers.length);
});
