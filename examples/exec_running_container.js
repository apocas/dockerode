var Docker = require('../lib/docker');

var docker = new Docker({
  socketPath: '/var/run/docker.sock'
});

/**
 * Get env list from running container
 * @param container
 */
function runExec(container) {
  options = {
    AttachStdout: true,
    AttachStderr: true,
    Tty: false,
    Cmd: ['env']
  };
  container.exec(options, function(err, exec) {
    if (err) return;

    exec.start(function(err, stream) {
      if (err) return;

      stream.setEncoding('utf8');
      stream.pipe(process.stdout);
    });
  });
}

docker.createContainer({
  Image: 'ubuntu',
  Cmd: ['/bin/bash']
}, function(err, container) {
  container.start({}, function(err, data) {
    runExec(container);
  });
});
