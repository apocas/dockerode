var Docker = require('../lib/docker');
var fs     = require('fs');

var socket = process.env.DOCKER_SOCKET || '/var/run/docker.sock';
var stats  = fs.statSync(socket);

if (!stats.isSocket()) {
  throw new Error('Are you sure the docker is running?');
}

var docker = new Docker({host: 'http://127.0.0.1', port: 2375});

docker.createContainer({Image: 'ubuntu', Cmd: ['/bin/bash']}, function (err, container) {
  container.start(function (err, data) {
    container.top({ps_args: 'aux'}, function(err, data) {
      console.log(data);
    });
  });
});
