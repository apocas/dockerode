var Docker = require('../../lib/docker');

var docker = new Docker({
  socketPath: '/var/run/docker.sock'
});


docker.buildImage('./Dockerfile.tar', {t: 'chrome'}, function(err, stream) {
  if(err) return;

  stream.pipe(process.stdout, {end: true});

  stream.on('end', function() {
    done();
  });
});

function done() {
  docker.createContainer({
    Image: 'chrome',
    Cmd: ['/bin/bash', '-c', 'xvfb-run -e /dev/stdout --server-args=\'-screen 0, 1024x768x16\' google-chrome -start-maximized http://www.google.com']
  }, function(err, container) {
    container.attach({
      stream: true,
      stdout: true,
      stderr: true,
      tty: true
    }, function(err, stream) {
      if(err) return;

      stream.pipe(process.stdout);

      container.start({
        Privileged: true
      }, function(err, data) {
        if(err) return;
      });
    });
  });
}
