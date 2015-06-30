var Docker = require('../lib/docker');

var docker = new Docker({
  socketPath: '/var/run/docker.sock'
});


docker.run('ubuntu', [], process.stdout, {
  'Volumes': {
    '/stuff': {}
  },
  'ExposedPorts': {
    '80/tcp': {}
  }
}, {
  'Binds': ['/home/vagrant:/stuff']
}, function(err, data, container) {
  console.log(data.StatusCode);
});
