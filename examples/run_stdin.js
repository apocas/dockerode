var Docker = require('../lib/docker');
var fs     = require('fs');

var socket = process.env.DOCKER_SOCKET || '/var/run/docker.sock'
var stats  = fs.statSync(socket)
if (!stats.isSocket()) {
  throw new Error("Are you sure the docker is running?")
}

var docker = new Docker({ socketPath: socket });
var optsc = {
  'Hostname': '',
  'User': '',
  'AttachStdin': true,
  'AttachStdout': true,
  'AttachStderr': true,
  'Tty': true,
  'OpenStdin': true,
  'StdinOnce': false,
  'Env': null,
  'Cmd': ['bash'],
  'Dns': ['8.8.8.8', '8.8.4.4'],
  'Image': 'ubuntu',
  'Volumes': {},
  'VolumesFrom': ''
};

function handler(err, container) {
  var attach_opts = {stream: true, stdin: true, stdout: true, stderr: true}
  container.attach(attach_opts, function handler(err, stream) {
    // Show outputs
    stream.pipe(process.stdout);

    // Connect stdin
    var isRaw = process.isRaw;
    process.stdin.resume();
    process.stdin.setRawMode(true)
    process.stdin.pipe(stream);

    container.start(function(err, data) {
      // Resize tty
      var resize = function() {
        var dimensions = {
          h: process.stdout.rows,
          w: process.stderr.columns
        }

        if (dimensions.h != 0 && dimensions.w != 0) {
          container.resize(dimensions, function() {})
        }
      }
      resize();
      process.stdout.on('resize', resize);

      container.wait(function(err, data) {
        process.stdout.removeListener('resize', resize);
        process.stdin.removeAllListeners();
        process.stdin.setRawMode(isRaw);
        process.stdin.resume();
        stream.end();
        process.exit();
      });
    });
  });
}

docker.createContainer(optsc, handler);
