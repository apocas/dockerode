# dockerode

[![NPM](https://nodei.co/npm/dockerode.png?downloads=true&stars=true)](https://nodei.co/npm/dockerode/)

Not another Node.js Docker.io Remote API module.

Why `dockerode` is different from other Docker node.js modules:

* **streams** - `dockerode` does NOT break any stream, it passes them to you allowing for some stream voodoo.
* **stream demux** - Supports optional demultiplexing of the new attach stream system implemented in Remote API v1.6.
* **entities** - containers and images are defined entities and not random static methods.
* **run** - `dockerode` allow you to seamless run commands in a container ala `docker run`.
* **tests** - `dockerode` really aims to have a good test set, allowing to follow `Docker` changes easily, quickly and painlessly.
* **feature-rich** - **All** `Docker` Remote API features implemented.


## Installation

`npm install dockerode`

## Usage

 * Input options are directly passed to Docker.io. Check [Docker Remote API documentation](http://docs.docker.io/reference/api/docker_remote_api/) for more details.
 * Return values are unchanged from Docker, official Docker.io documentation will also apply to them.
 * Check the tests for more examples.

### Getting started

To use `dockerode` first you need to instantiate it:

``` js
var Docker = require('dockerode');
var docker = new Docker({socketPath: '/var/run/docker.sock'});
var docker2 = new Docker({host: 'http://192.168.1.10', port: 3000});
var docker3 = new Docker({protocol:'http', host: '127.0.0.1', port: 3000});
var docker4 = new Docker({host: '127.0.0.1', port: 3000}); //defaults to http
//...
```

### Manipulating a container:

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

You may also specify default options for each container's operations, which will always be used for the specified container and operation.

``` js
container.defaultOptions.start.Binds = ["/tmp:/tmp:rw"];
```

### Stopping all containers on a host

``` js
docker.listContainers(function (err, containers) {
  containers.forEach(function (containerInfo) {
    docker.getContainer(containerInfo.Id).stop(cb);
  });
});
```

### Building an Image

``` js
docker.buildImage('archive.tar', {t: imageName}, function (err, response){
  //...
});
```

### Creating a container:

``` js
docker.createContainer({Image: 'ubuntu', Cmd: ['/bin/bash'], name: 'ubuntu-test'}, function (err, container) {
  container.start(function (err, data) {
    //...
  });
});
//...
```

### Streams goodness:

``` js
//tty:true
docker.createContainer({ /*...*/ Tty: true /*...*/ }, function(err, container) {

  /* ... */

  container.attach({stream: true, stdout: true, stderr: true}, function (err, stream) {
    stream.pipe(process.stdout);
  });

  /* ... */
}

//tty:false
docker.createContainer({ /*...*/ Tty: false /*...*/ }, function(err, container) {

  /* ... */

  container.attach({stream: true, stdout: true, stderr: true}, function (err, stream) {
    //dockerode may demultiplex attach streams for you :)
    container.modem.demuxStream(stream, process.stdout, process.stderr);
  });

  /* ... */
}

docker.createImage({fromImage: 'ubuntu'}, function (err, stream) {
  stream.pipe(process.stdout);
});

//...
```

### Equivalent of `docker run` in `dockerode`:

* `image` - container image
* `cmd` - command to be executed
* `stream` - stream(s) which will be used for execution output.
* `create_options` - options used for container creation. (optional)
* `start_options` - options used for container start. (optional)
* `callback` - callback called when execution ends.

``` js
docker.run('ubuntu', ['bash', '-c', 'uname -a'], process.stdout, function (err, data, container) {
  console.log(data.StatusCode);
});
```

or, if you want to split stdout and stderr (you must to pass `Tty:false` as an option for this to work)

``` js
docker.run('ubuntu', ['bash', '-c', 'uname -a'], [process.stdout, process.stderr], {Tty:false}, function (err, data, container) {
  console.log(data.StatusCode);
});
```

Run also returns an EventEmitter supporting the following events: container, stream, data. Allowing stuff like this:

``` js
docker.run('ubuntu', ['bash', '-c', 'uname -a'], [process.stdout, process.stderr], {Tty:false}, function (err, data, container) {
  //...
}).on('container', function (container) {
  container.defaultOptions.start.Binds = ["/tmp:/tmp:rw"];
});
```

### Equivalent of `docker pull` in `dockerode`:

* `repoTag` - container image name (optionally with tag)
  `myrepo/myname:withtag`
* `opts` - extra options passed to create image.
* `callback` - callback called when execution ends.

``` js
docker.pull('myrepo/myname:tag', function (err, stream) {  
  // streaming output from pull...
});
```

## Tests

Tests are implemented using `mocha` and `chai`. Run them with `npm test`.

## License

Pedro Dias <abru.pt>

Licensed under the Apache license, version 2.0 (the "license"); You may not use this file except in compliance with the license. You may obtain a copy of the license at:

    http://www.apache.org/licenses/LICENSE-2.0.html

Unless required by applicable law or agreed to in writing, software distributed under the license is distributed on an "as is" basis, without warranties or conditions of any kind, either express or implied. See the license for the specific language governing permissions and limitations under the license.
