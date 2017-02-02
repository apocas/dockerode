var Docker = require('../../lib/docker');
var docker = new Docker({
  socketPath: '/var/run/docker.sock'
});

docker.buildImage({
  context: __dirname,
  src: ['Dockerfile', 'run.js']
}, {
  t: 'imgcwd'
}, function(error, output) {
  if (error) {
    return console.error(error);
  }
  output.pipe(process.stdout);
});
