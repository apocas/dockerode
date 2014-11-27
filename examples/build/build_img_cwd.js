var Docker = require('../../lib/docker'),
  tar = require('tar-fs');

var docker = new Docker({
  socketPath: '/var/run/docker.sock'
});

var tarStream = tar.pack(process.cwd());
docker.buildImage(tarStream, {
  t: 'imgcwd'
}, function(error, output) {
  output.pipe(process.stdout);
});
