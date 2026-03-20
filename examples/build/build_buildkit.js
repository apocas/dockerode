var Docker = require('../../lib/docker'),
  tar = require('tar-fs');

var docker = new Docker({
  socketPath: '/var/run/docker.sock'
});

var tarStream = tar.pack(process.cwd());

// BuildKit v2 builds return base64-encoded protobuf logs
// Use docker.followProgress() to decode them automatically
// (This works the same as docker.modem.followProgress but decodes BuildKit output)
docker.buildImage(tarStream, {
  t: 'myimage:buildkit',
  version: '2'  // Enable BuildKit
}, function(error, stream) {
  if (error) {
    return console.error(error);
  }

  // docker.followProgress works with both regular and BuildKit builds
  docker.followProgress(stream,
    function onFinished(err, result) {
      if (err) {
        console.error('Build failed:', err);
      } else {
        console.log('Build completed successfully!');
      }
    },
    function onProgress(event) {
      // Each event is already decoded and formatted
      if (event.stream) {
        process.stdout.write(event.stream);
      }
    }
  );
});
