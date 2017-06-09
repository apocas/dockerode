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
  },
  'Hostconfig': {
    'Binds': ['/home/vagrant:/stuff'],
  }
}, function(err, data, container) {
  if (err){
    return console.error(err);
  }
  console.log(data.StatusCode);
});



//run and give a container a name and a label
docker.run('redis', [], undefined, {
  "Name": 'MyNamedContainer',
  "Labels": {
    "environment": "blueWhale"
  },
  "HostConfig": {
    "PortBindings": {
      "6379/tcp": [
        {
          "HostPort": "0"   //Map container to a random unused port.
        }
      ]
    }
  }
}, function(err, data, container) {
  if (err){
    return console.error(err);
  }
  console.log(data.StatusCode);
});