# dockerode

[![NPM](https://nodei.co/npm/dockerode.png?downloads=true&stars=true)](https://nodei.co/npm/dockerode/)

Not another Node.js Docker.io Remote API module.

Why is `dockerode` different from all the Docker node.js module out there:

* **streams** - `dockerode` does NOT break any stream, it passes them to you allowing for some stream voodoo.
* **stream demux** - Supports optional demultiplexing of the new attach stream system implemented in Remote API v1.6. 
* **entities** - containers and images are defined entities and not random static methods.
* **run** - `dockerode` allow you to seamless run commands in a container ala `docker run`.
* **tests** - `dockerode` really aims to have a good test set, allowing to follow `Docker` changes easily, quickly and painlessly.
* **feature-rich** - ALL `Docker` Remote API features implemented.


## installation

`npm install dockerode`


## getting started

to use `dockerode` first you need to instantiate it:

``` js
var Docker = require('dockerode');
var docker = new Docker({socketPath: '/var/run/docker.sock'});
var docker2 = new Docker({host: 'http://192.168.1.10', port: 3000});
//...
```

Manipulating a container:

``` js
var container = docker.getContainer('71501a8ab0f8');

container.start(function (err, data) {
  console.log(data);
});

container.remove(function (err, data) {
  console.log(data);
});

//...
```

Creating a container:
``` js
docker.createContainer({Image: 'ubuntu', Cmd: ['/bin/bash']}, function(err, container) {
  container.start(function(err, data) {
    //...
  });
});
//...
```

Streams goodness:

``` js
//tty:true
container.attach({stream: true, stdout: true, stderr: true, tty: true}, function(err, stream) {
  stream.pipe(process.stdout);
});

//tty:false
container.attach({stream: true, stdout: true, stderr: true, tty: false}, function(err, stream) {
  //http://docs.docker.io/en/latest/api/docker_remote_api_v1.7/#post--containers-(id)-attach
  //dockerode may demultiplex the streams for you :)
  container.modem.demuxStream(stream, process.stdout, process.stderr);
});

docker.createImage({fromImage: 'ubuntu'}, function(err, stream) {
  stream.pipe(process.stdout);
});

//...
```

Equivalent of `docker run` in `dockerode`:

* `image` - container image
* `cmd` - command to be executed
* `stream` - stream which will be used for execution output.
* `callback` - callback called when execution ends.

``` js
docker.run('ubuntu', ['bash', '-c', 'uname -a'], process.stdout, function(err, data, container) {
  console.log(data.StatusCode);
});
```

Equivalent of `docker pull` in `dockerode`:

* `repoTag` - container image name (optionally with tag)
  `myrepo/myname:withtag`
* `opts` - extra options passed to create image see [docker api](http://docs.docker.io/en/latest/api/docker_remote_api_v1.8/#create-an-image)
* `callback` - callback called when execution ends.

``` js
docker.pull('myrepo/myname:tag', function(err, stream) {  
  // streaming output from pull... 
  // Also see: http://docs.docker.io/en/latest/api/docker_remote_api_v1.8/#create-an-image
});
```

Check the tests for more examples.

## notes

* Input options are directly passed to Docker.io check [Docker Remote API documentation](http://docs.docker.io/en/latest/api/docker_remote_api/) for more details.
* Return values are unchanged from Docker, official Docker.io documentation will also apply to them.


## tests

Tests were implemented using `mocha` and `chai` do `npm test` to run them.

## license

Pedro Dias <abru.pt>

licensed under the apache license, version 2.0 (the "license");
you may not use this file except in compliance with the license.
you may obtain a copy of the license at

    http://www.apache.org/licenses/LICENSE-2.0.html

unless required by applicable law or agreed to in writing, software
distributed under the license is distributed on an "as is" basis,
without warranties or conditions of any kind, either express or implied.
see the license for the specific language governing permissions and
limitations under the license.
