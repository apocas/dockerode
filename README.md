# dockerode

[![NPM](https://nodei.co/npm/dockerode.png?downloads=true&downloadRank=true)](https://nodei.co/npm/dockerode/)
[![NPM](https://nodei.co/npm-dl/dockerode.png?months=6&height=3)](https://nodei.co/npm/dockerode/)

Not another Node.js Docker Remote API module.

Why `dockerode` is different from other Docker node.js modules:

* **streams** - `dockerode` does NOT break any stream, it passes them to you allowing for some stream voodoo.
* **stream demux** - Supports optional demultiplexing.
* **entities** - containers, images and execs are defined entities and not random static methods.
* **run** - `dockerode` allow you to seamless run commands in a container ala `docker run`.
* **tests** - `dockerode` really aims to have a good test set, allowing to follow `Docker` changes easily, quickly and painlessly.
* **feature-rich** - There's a real effort in keeping **All** `Docker` Remote API features implemented and tested.


## Installation

`npm install dockerode`

## Usage

 * Input options are directly passed to Docker. Check [Docker Remote API documentation](https://docs.docker.com/engine/reference/api/docker_remote_api/) for more details.
 * Return values are unchanged from Docker, official Docker documentation will also apply to them.
 * Check the tests and examples folder for more examples.

### Getting started

To use `dockerode` first you need to instantiate it:

``` js
var Docker = require('dockerode');
var docker = new Docker({socketPath: '/var/run/docker.sock'});
var docker1 = new Docker(); //defaults to above if env variables are not used
var docker2 = new Docker({host: 'http://192.168.1.10', port: 3000});
var docker3 = new Docker({protocol:'http', host: '127.0.0.1', port: 3000});
var docker4 = new Docker({host: '127.0.0.1', port: 3000}); //defaults to http

//protocol http vs https is automatically detected
var docker5 = new Docker({
  host: '192.168.1.10',
  port: process.env.DOCKER_PORT || 2375,
  ca: fs.readFileSync('ca.pem'),
  cert: fs.readFileSync('cert.pem'),
  key: fs.readFileSync('key.pem')
});

var docker6 = new Docker({
  protocol: 'https', //you can enforce a protocol
  host: '192.168.1.10',
  port: process.env.DOCKER_PORT || 2375,
  ca: fs.readFileSync('ca.pem'),
  cert: fs.readFileSync('cert.pem'),
  key: fs.readFileSync('key.pem')
});
//...
```

### Manipulating a container:

``` js
// create a container entity. does not query API
var container = docker.getContainer('71501a8ab0f8');

// query API for container info
container.inspect(function (err, data) {
  console.log(data);
});

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

There is also support for [HTTP connection hijacking](https://docs.docker.com/engine/reference/api/docker_remote_api_v1.22/#3-2-hijacking),
which allows for cleaner interactions with commands that work with stdin and stdout separately.

```js
docker.createContainer({Tty: false, /*... other options */}, function(err, container) {
  container.exec({Cmd: ['shasum', '-'], AttachStdin: true, AttachStdout: true}, function(err, exec) {
    exec.start({hijack: true, stdin: true}, function(err, stream) {
      // shasum can't finish until after its stdin has been closed, telling it that it has
      // read all the bytes it needs to sum. Without a socket upgrade, there is no way to
      // close the write-side of the stream without also closing the read-side!
      fs.createReadStream('node-v5.1.0.tgz', 'binary').pipe(stream);

      // Fortunately, we have a regular TCP socket now, so when the readstream finishes and closes our
      // stream, it is still open for reading and we will still get our results :-)
      docker.modem.demuxStream(stream, process.stdout, process.stderr);
    });
  });
});
```

### Equivalent of `docker run` in `dockerode`:
docker.run(image, cmd, stream, create_options, start_options, callback)

* `image` - container image - string
* `cmd` - command to be executed - string or array of strings
* `stream` - stream(s) which will be used for execution output - stream or array of streams
* `create_options` - options used for container creation. (optional) - object
* `start_options` - options used for container start. (optional) - object
* `callback` - callback called when execution ends.

``` js
docker.run('ubuntu', ['bash', '-c', 'uname -a'], process.stdout, function (err, data, container) {
  console.log(data.StatusCode);
});
```
The following list of attributes for create_options and start_options are taken from: https://docs.docker.com/engine/reference/api/docker_remote_api_v1.19/ (Create a container).
As much as possible, the equivalent CLI flag has been added at the end of the attribute's description:

<a href="#hostname" name="hostname">#</a> <b>Hostname</b> - A string value containing the hostname to use for the container.
<a href="Domainname" name="Domainname">#</a> <b>Domainname</b> - A string value containing the domain name to use for the container.
<a href="User" name="User">#</a> <b>User</b> - A string value specifying the user inside the container.
<a href="Memory" name="Memory">#</a> <b>Memory</b> - Memory limit in bytes.
<a href="Name" name="Name">#</a> <b>Name</b> - name of the container
<a href="MemorySwap" name="MemorySwap">#</a> <b>MemorySwap</b> - Total memory limit (memory + swap); set -1 to disable swap You must use this with memory and make the swap value larger than memory.
<a href="CpuShares" name="CpuShares">#</a> <b>CpuShares</b> - An integer value containing the container’s CPU Shares (ie. the relative weight vs other containers).
<a href="CpuPeriod" name="CpuPeriod">#</a> <b>CpuPeriod</b> - The length of a CPU period in microseconds.
<a href="CpuQuota" name="CpuQuota">#</a> <b>CpuQuota</b> - Microseconds of CPU time that the container can get in a CPU period.
<a href="Cpuset" name="Cpuset">#</a> <b>Cpuset</b> - Deprecated please don’t use. Use CpusetCpus instead.
<a href="CpusetCpus" name="CpusetCpus">#</a> <b>CpusetCpus</b> - String value containing the cgroups CpusetCpus to use.
<a href="CpusetMems" name="CpusetMems">#</a> <b>CpusetMems</b> - Memory nodes (MEMs) in which to allow execution (0-3, 0,1). Only effective on NUMA systems.
<a href="BlkioWeight" name="BlkioWeight">#</a> <b>BlkioWeight</b> - Block IO weight (relative weight) accepts a weight value between 10 and 1000.
<a href="OomKillDisable" name="OomKillDisable">#</a> <b>OomKillDisable</b> - Boolean value, whether to disable OOM Killer for the container or not.
<a href="MacAddress" name="MacAddress">#</a> <b>MacAddress</b> - the container’s MAC address in the form: 12:34:56:78:9a:bc,--mac-address
<a href="AttachStdin" name="AttachStdin">#</a> <b>AttachStdin</b> - Boolean value, attaches to stdin.
<a href="AttachStdout" name="AttachStdout">#</a> <b>AttachStdout</b> - Boolean value, attaches to stdout.
<a href="AttachStderr" name="AttachStderr">#</a> <b>AttachStderr</b> - Boolean value, attaches to stderr.
<a href="Tty" name="Tty">#</a> <b>Tty</b> - Boolean value, Attach standard streams to a tty, including stdin if it is not closed.
<a href="OpenStdin" name="OpenStdin">#</a> <b>OpenStdin</b> - Boolean value, opens stdin,
<a href="StdinOnce" name="StdinOnce">#</a> <b>StdinOnce</b> - Boolean value, close stdin after the 1 attached client disconnects.
<a href="Env" name="Env">#</a> <b>Env</b> - A list of environment variables in the form of ["VAR=value"[,"VAR2=value2"]], -e
<a href="Labels" name="Labels">#</a> <b>Labels</b> - Adds a map of labels to a container. To specify a map: {"key":"value"[,"key2":"value2"]}
<a href="Cmd" name="Cmd">#</a> <b>Cmd</b> - Command to run specified as a string or an array of strings, e.g. ['/bin/bash', '-c', 'tail -f /var/log/dmesg'],
<a href="Entrypoint" name="Entrypoint">#</a> <b>Entrypoint</b> - Set the entry point for the container as a string or an array of strings.
<a href="Image" name="Image">#</a> <b>Image</b> - A string specifying the image name to use for the container.
<a href="Volumes – An object mapping mount point paths (strings) inside the container to empty objects, e.g. { '/stuff': {}   }." name="Volumes – An object mapping mount point paths (strings) inside the container to empty objects, e.g. { '/stuff': {}   }.">#</a> <b>Volumes – An object mapping mount point paths (strings) inside the container to empty objects, e.g. { '/stuff': {}   }.</b> -v
<a href="WorkingDir" name="WorkingDir">#</a> <b>WorkingDir</b> - A string specifying the working directory for commands to run in.
<a href="NetworkDisabled" name="NetworkDisabled">#</a> <b>NetworkDisabled</b> - Boolean value, when true disables networking for the container
<a href="ExposedPorts" name="ExposedPorts">#</a> <b>ExposedPorts</b> - An object mapping ports to an empty object in the form of: "ExposedPorts": { "<port>/<tcp|udp>: {}" }, -p
<a href="HostConfig" name="HostConfig">#</a> <b>HostConfig</b> - a branch that describes the host configuration attributes
<a href="Binds" name="Binds">#</a> <b>Binds</b> - A list of volume bindings for this container. Each volume binding is a string in one of these forms:
      * container_path to create a new volume for the container
      * host_path:container_path to bind-mount a host path into the container
      * host_path:container_path:ro to make the bind-mount read-only inside the container. -v
<a href="Links" name="Links">#</a> <b>Links</b> - A list of links for the container. Each link entry should be in the form of container_name:alias, --link
<a href="LxcConf" name="LxcConf">#</a> <b>LxcConf</b> - LXC specific configurations. These configurations only work when using the lxc execution driver.
<a href="PortBindings" name="PortBindings">#</a> <b>PortBindings</b> - A map of exposed container ports and the host port they should map to. A JSON object in the form { <port>/<protocol>: [{ "HostPort": "<port>" }] } Take note that port is specified as a string and not an integer value.
<a href="PublishAllPorts" name="PublishAllPorts">#</a> <b>PublishAllPorts</b> - Allocates a random host port for all of a container’s exposed ports. Specified as a boolean value.
<a href="Privileged" name="Privileged">#</a> <b>Privileged</b> - Gives the container full access to the host. Specified as a boolean value.
<a href="ReadonlyRootfs" name="ReadonlyRootfs">#</a> <b>ReadonlyRootfs</b> - Mount the container’s root filesystem as read only. Specified as a boolean value.
<a href="Dns" name="Dns">#</a> <b>Dns</b> - A list of DNS servers for the container to use, array of strings. --dns
<a href="DnsSearch" name="DnsSearch">#</a> <b>DnsSearch</b> - A list of DNS search domains
<a href="ExtraHosts" name="ExtraHosts">#</a> <b>ExtraHosts</b> - A list of hostnames/IP mappings to add to the container’s /etc/hosts file. Specified in the form ["hostname:IP"].
<a href="VolumesFrom" name="VolumesFrom">#</a> <b>VolumesFrom</b> - A list of volumes to inherit from another container. Specified in the form <container name>[:<ro|rw>], --volumes-from
<a href="CapAdd" name="CapAdd">#</a> <b>CapAdd</b> - A list of kernel capabilities to add to the container.
<a href="Capdrop" name="Capdrop">#</a> <b>Capdrop</b> - A list of kernel capabilities to drop from the container.
<a href="RestartPolicy" name="RestartPolicy">#</a> <b>RestartPolicy</b> - The behavior to apply when the container exits. The value is an object with a Name property of either "always" to always restart or "on-failure" to restart only when the container exit code is non-zero. If on-failure is used, MaximumRetryCount controls the number of times to retry before giving up. The default is not to restart. (optional) An ever increasing delay (double the previous delay, starting at 100mS) is added before each restart to prevent flooding the server.
<a href="NetworkMode" name="NetworkMode">#</a> <b>NetworkMode</b> - Sets the networking mode for the container. Supported values are: bridge, host, and container:<name|id>, --net
<a href="Devices" name="Devices">#</a> <b>Devices</b> - A list of devices to add to the container specified as a JSON object in the form { "PathOnHost": "/dev/deviceName", "PathInContainer": "/dev/deviceName", "CgroupPermissions": "mrw"}
<a href="Ulimits" name="Ulimits">#</a> <b>Ulimits</b> - A list of ulimits to set in the container, specified as { "Name": <name>, "Soft": <soft limit>, "Hard": <hard limit> }, for example: Ulimits: { "Name": "nofile", "Soft": 1024, "Hard": 2048 }
<a href="SecurityOpt" name="SecurityOpt">#</a> <b>SecurityOpt</b> - A list of string values to customize labels for MLS systems, such as SELinux.
<a href="LogConfig" name="LogConfig">#</a> <b>LogConfig</b> - Log configuration for the container, specified as a JSON object in the form { "Type": "<driver_name>", "Config": {"key1": "val1"}}. Available types: json-file, syslog, journald, none. syslog available options are: address.
<a href="CgroupParent" name="CgroupParent">#</a> <b>CgroupParent</b> - Path to cgroups under which the cgroup for the container will be created. If the path is not absolute, the path is considered to be relative to the cgroups path of the init process. Cgroups will be created if they do not already exist.


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

#### Pull from private repos

`docker-modem` already base64 encodes the necessary auth object for you.

``` js
var auth = {
  username: 'username',
  password: 'password',
  auth: '',
  email: 'your@email.email',
  serveraddress: 'https://index.docker.io/v1'
};

docker.pull('tag', {'authconfig': auth}, function (err, stream) {
  //...
});
```

If you already have a base64 encoded auth object, you can use it directly:

```js
var auth = { key: 'yJ1J2ZXJhZGRyZXNzIjoitZSI6Im4OCIsImF1dGgiOiIiLCJlbWFpbCI6ImZvbGllLmFkcmc2VybmF0iLCJzZX5jb2aHR0cHM6Ly9pbmRleC5kb2NrZXIuaW8vdZvbGllYSIsInBhc3N3b3JkIjoiRGVjZW1icmUjEvIn0=' }
```


## Helper functions

* `followProgress` - allows to fire a callback only in the end of a stream based process. (build, pull, ...)

``` js
//followProgress(stream, onFinished, [onProgress])
docker.pull(repoTag, function(err, stream) {
  //...
  docker.modem.followProgress(stream, onFinished, onProgress);

  function onFinished(err, output) {
    //output is an array with output json parsed objects
    //...
  }
  function onProgress(event) {
    //...
  }
});
```

* `demuxStream` - demux stdout and stderr

``` js
//demuxStream(stream, stdout, stderr)
container.attach({
  stream: true,
  stdout: true,
  stderr: true
}, function handler(err, stream) {
  //...
  container.modem.demuxStream(stream, process.stdout, process.stderr);
  //...
});
```

## Tests

 * `docker pull ubuntu:latest` to prepare your system for the tests.
 * Tests are implemented using `mocha` and `chai`. Run them with `npm test`.

## Examples

Check the examples folder for more specific use cases examples.

## License

Pedro Dias - [@pedromdias](https://twitter.com/pedromdias)

Licensed under the Apache license, version 2.0 (the "license"); You may not use this file except in compliance with the license. You may obtain a copy of the license at:

    http://www.apache.org/licenses/LICENSE-2.0.html

Unless required by applicable law or agreed to in writing, software distributed under the license is distributed on an "as is" basis, without warranties or conditions of any kind, either express or implied. See the license for the specific language governing permissions and limitations under the license.
