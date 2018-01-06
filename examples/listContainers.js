var Docker = require('../lib/docker');
var fs     = require('fs');

var socket = process.env.DOCKER_SOCKET || '/var/run/docker.sock';
var stats  = fs.statSync(socket);

if (!stats.isSocket()) {
  throw new Error('Are you sure the docker is running?');
}


async function main() {
  let docker = new Docker({ socketPath: socket });
  let container = await docker.getContainer("136448e655d06fdbe70baf86ea5003b9b3d791d615a9a74940f3c990fec804a8")
  console.log(await container.inspect({all: true}))
}
main();


// docker.listContainers({all: false}, function(err, containers) {
//   console.log('!ALL: ' + containers.length);
// });

// // filter by labels
// var opts = {
//   "limit": 3,
//   "filters": '{"label": ["staging","env=green"]}'
// };

// // maps are also supported (** requires docker-modem 0.3+ **)
// opts["filters"] = {
//   "label": [
//     "staging",
//     "env=green"
//   ]
// };

// docker.listContainers(opts, function(err, containers) {
//   console.log('Containers labeled staging + env=green : ' + containers.length);
// });
