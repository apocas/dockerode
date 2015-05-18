var Docker = require('../lib/docker');
var fs     = require('fs');

var socket = process.env.DOCKER_SOCKET || '/var/run/docker.sock';
var stats  = fs.statSync(socket);

if (!stats.isSocket()) {
  throw new Error('Are you sure the docker is running?');
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

var previousKey,
    CTRL_P = '\u0010',
    CTRL_Q = '\u0011';

function handler(err, container) {
  var attach_opts = {stream: true, stdin: true, stdout: true, stderr: true};

  container.attach(attach_opts, function handler(err, stream) {
    // Show outputs
    stream.pipe(process.stdout);

    // Connect stdin
    var isRaw = process.isRaw;
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.setRawMode(true);
    process.stdin.pipe(stream);

    process.stdin.on('data', function(key) {
      // Detects it is detaching a running container
      if (previousKey === CTRL_P && key === CTRL_Q) exit(stream, isRaw);
      previousKey = key;
    });

    container.start(function(err, data) {
      resize(container);
      process.stdout.on('resize', resize);

      container.wait(function(err, data) {
        exit(stream, isRaw);
      });
    });
  });
}

// Resize tty
function resize (container) {
  var dimensions = {
    h: process.stdout.rows,
    w: process.stderr.columns
  };

  if (dimensions.h != 0 && dimensions.w != 0) {
    container.resize(dimensions, function() {});
  }
}

// Exit container
function exit (stream, isRaw) {
  process.stdout.removeListener('resize', resize);
  process.stdin.removeAllListeners();
  process.stdin.setRawMode(isRaw);
  process.stdin.resume();
  stream.end();
  process.exit();
}

docker.createContainer(optsc, handler);
