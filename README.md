# dockerode

Yet another node.js Docker.io Remote API module.

Why is `dockerode` different from all the Docker node.js module out there:

* **streams** - `dockerode` does NOT break any stream, it passes them to you allowing for some stream voodoo.
* **entities** - containers and images are defined entities and not random static methods.
* **run** - `dockerode` allow you to seamless run commands in a container ala `docker run`.
* **tests** - `dockerode` really aims to have a good test set, allowing to follow `Docker` changes easily, quickly and painfully.
* **ws** - New websocket endpoints introduced in 0.6 are supported. (beta, do not use in production yet)
* **features** - implement ALL `Docker` Remote API features. (94% implemented)


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
container.attach({stream: true, stdout: true, stderr: true}, function(err, stream) {
  stream.pipe(process.stdout);
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
* `temporary` - if `true` container will be removed after execution ends.
* `callback` - callback caled when execution ends.

``` js
docker.run('ubuntu', 'uname -a', process.stdout, true, function(err, data) {
  console.log(data.StatusCode);
});
```

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