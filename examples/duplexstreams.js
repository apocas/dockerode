var Docker = require('../lib/docker');

var docker = new Docker();

var createContainer = function(i) {
  console.log('creating container ' + i);
  return docker.createContainer({
    Cmd: '/bin/bash',
    Image: 'ubuntu:12.04',
    OpenStdin: true,
    Tty: true
  }, function(err, container) {
    console.log('attaching to container ' + i);
    return container.attach({
      stream: true,
      stdin: true,
      stdout: true
    }, function(err, ttyStream) {
      return setTimeout(function() {
        console.log('ending container ' + i + ' tty stream');
        //console.log(ttyStream);
        ttyStream.end();
        return container.remove({
          force: true
        }, function() {
          return console.log('container ' + i + ' removed');
        });
      }, 5000);
    });
  });
};

for (var i = 0; i <= 20; i++) {
  setTimeout(createContainer, i * 250, i);
}
