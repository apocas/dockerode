/*jshint -W030 */

var expect = require('chai').expect;
var docker = require('./spec_helper').docker;

var testImage = 'ubuntu:14.04';
var testVolume = {
    "Name": "tardis",
    "Driver": "local",
    "Mountpoint": "/var/lib/docker/volumes/tardis"
};
var testNetwork = {
  "Name":"isolated_nw",
  "Driver":"bridge",
  "IPAM":{
    "Config":[{
      "Subnet":"172.20.0.0/16",
      "IPRange":"172.20.10.0/24",
      "Gateway":"172.20.10.11"
      }]
}};
describe("#docker", function() {

  describe("#checkAuth", function() {
    it("should fail auth", function(done) {
      this.timeout(15000);

      function handler(err, data) {
        expect(err).not.to.be.null;
        done();
      }

      docker.checkAuth({username: 'xpto', password: 'dang', email: 'xpto@pxpto.pt'}, handler);
    });
  });

  describe("#buildImage", function() {
    it("should build image from file", function(done) {
      this.timeout(60000);

      function handler(err, stream) {
        expect(err).to.be.null;
        expect(stream).to.be.ok;

        stream.pipe(process.stdout, {end: true});

        stream.on('end', function() {
          done();
        });
      }

      docker.buildImage('./test/test.tar', {}, handler);
    });

    it("should build image from readable stream", function(done) {
      this.timeout(60000);

      function handler(err, stream) {
        expect(err).to.be.null;
        expect(stream).to.be.ok;

        stream.pipe(process.stdout, {end: true});

        stream.on('end', function() {
          done();
        });
      }

      var data = require('fs').createReadStream('./test/test.tar');
      docker.buildImage(data, {}, handler);
    });
  });

  describe("#getEvents", function() {
    it("should get events", function(done) {
      this.timeout(30000);

      function handler(err, stream) {
        expect(err).to.be.null;
        expect(stream).to.be.ok;
        //stream.pipe(process.stdout, {end: true});
        done();
      }

      docker.getEvents({since: ((new Date().getTime()/1000) - 60).toFixed(0)}, handler);
    });
  });

  describe("#getPing", function() {
    it("should ping server", function(done) {
      this.timeout(30000);

      function handler(err, data) {
        expect(err).to.be.null;
        done();
      }

      docker.ping(handler);
    });
  });

  describe("#testTimeout", function() {
    it("should timeout", function(done) {
      this.timeout(30000);

      function handler(err, data) {
        expect(err).to.not.be.null;
        done();
      }

      dockert.searchImages({term: 'node'}, handler);
    });
  });

  describe('#pull', function() {
    this.timeout(120000);

    // one image with one tag
    var repoTag = testImage;

    function locateImage(image, callback) {
      docker.listImages(function(err, list) {
        if (err) return callback(err);

        // search for the image in the RepoTags
        var image;
        for (var i = 0, len = list.length; i < len; i++) {
          if (list[i].RepoTags.indexOf(repoTag) !== -1) {
            // ah ha! repo tags
            return callback(null, docker.getImage(list[i].Id));
          }
        }

        return callback();
      });
    }

    /*
    beforeEach(function(done) {
      locateImage(repoTag, function(err, image) {
        if (err) return done(err);
        if (image) return image.remove(done);
        done();
      });
    });
    */

    it('should pull image from remote source', function(done) {
      function handler() {
        locateImage(repoTag, function(err, image) {
          if (err) return done(err);
          // found the image via list images
          expect(image).to.be.ok;
          done();
        });
      }

      docker.pull(repoTag, function(err, stream) {
        if (err) return done(err);
        stream.pipe(process.stdout);
        stream.once('end', handler);
      });
    });

    it('should pull image from remote source using followProgress', function(done) {
      docker.pull(repoTag, function(err, stream) {
        if (err) return done(err);
        docker.modem.followProgress(stream, onFinished, onProgress);

        function onFinished(err, output) {
          //ouput is an array of objects, already json parsed.
          if (err) return done(err);
          expect(output).to.be.a('array');
          done();
        }

        function onProgress(event) {
          expect(event).to.be.ok;
        }
      });
    });

    it('should pull image from remote source using followProgress and firing only in the end', function(done) {
      docker.pull(repoTag, function(err, stream) {
        if (err) return done(err);
        docker.modem.followProgress(stream, onFinished);

        function onFinished(err, output) {
          //ouput is an array of objects, already json parsed.
          if (err) return done(err);
          expect(output).to.be.a('array');
          done();
        }
      });
    });

    it('should pull image from remote source using followProgress and pause', function(done) {
      docker.pull(repoTag, function(err, stream) {
        if (err) return done(err);
        docker.modem.followProgress(stream, onFinished, onProgress);

        function onFinished(err, output) {
          if (err) return done(err);
          expect(output).to.be.a('array');
        }

        function onProgress(event) {
          stream.destroy();
          expect(event).to.be.ok;
          done();
        }
      });
    });
  });

  describe("#run", function() {
    this.timeout(30000);

    it("should emit partial data", function(done) {
      function handler(err, data, container) {
        expect(err).to.be.null;
        //container is created
        expect(container).to.be.ok;

        container.remove(function(err, data) {
          expect(err).to.be.null;
        });
      }

      var ee = docker.run(testImage, ['bash', '-c', 'uname -a'], process.stdout, handler);
      ee.on('container', function (container) {
        expect(container).to.be.ok;
      });
      ee.on('stream', function (stream) {
        expect(stream).to.be.ok;
      });
      ee.on('data', function (data) {
        expect(data).to.be.ok;
        done();
      });
    });

    it("should run a command", function(done) {
      function handler(err, data, container) {
        expect(err).to.be.null;
        //container is created
        expect(container).to.be.ok;

        container.remove(function(err, data) {
          expect(err).to.be.null;
          done();
        });
      }

      docker.run(testImage, ['bash', '-c', 'uname -a'], process.stdout, handler);
    });

    it("should run a command with start options", function(done){
      function handler(err, data, container) {
        expect(err).to.be.null;

        container.inspect(function(err, data){
          expect(err).to.be.null;
          expect(data.HostConfig.Privileged).to.be.true;

          container.remove(function(err, data){
            expect(err).to.be.null;
            done();
          });
        });
      }
      docker.run(testImage, ['bash', '-c', 'uname -a'], process.stdout, {}, {Privileged : true}, handler);
    });

    it("should run a command with create options", function(done){
      function handler(err, data, container) {
        expect(err).to.be.null;

        container.inspect(function(err, data){
          expect(err).to.be.null;

          container.remove(function(err, data){
            expect(err).to.be.null;
            done();
          });
        });
      }
      docker.run(testImage, ['bash', '-c', 'uname -a'], process.stdout, {}, handler);
    });
  });

  describe("#createVolume", function() {
    it("should create and remove a volume", function(done) {
      this.timeout(5000);

      function handler(err, volume) {
        expect(err).to.be.null;
        expect(volume).to.be.ok;

        volume.inspect(function (err, info) {
          expect(err).to.be.null;
          expect(info.Name).to.equal(testVolume.Name);

          volume.remove(function(err, data) {
            expect(err).to.be.null;
            done();
          });
        });
      }

      docker.createVolume(testVolume, handler);
    });
  });

  describe("#createNetwork", function() {
    it("should create and remove a network", function(done) {
      this.timeout(5000);

      function handler(err, network) {
        expect(err).to.be.null;
        expect(network).to.be.ok;

        network.inspect(function (err, info) {
          expect(err).to.be.null;
          expect(info.Name).to.equal(testNetwork.Name);
          expect(info.Id).to.not.be.null;

          network.remove(function(err, data) {
            expect(err).to.be.null;
            done();
          });
        });
      }

      docker.createNetwork(testNetwork, handler);
    });
  });



  describe("#createContainer", function() {
    it("should create and remove a container", function(done) {
      this.timeout(5000);

      function handler(err, container) {
        expect(err).to.be.null;
        expect(container).to.be.ok;

        container.inspect(function (err, info) {
          expect(err).to.be.null;
          expect(info.Name).to.equal('/test');

          container.remove(function(err, data) {
            expect(err).to.be.null;
            done();
          });
        });
      }

      docker.createContainer({Image: testImage, Cmd: ['/bin/bash'], name: 'test'}, handler);
    });
  });

  describe("#createImage", function() {
    it("should create an image", function(done) {
      this.timeout(120000);

      function handler(err, stream) {
        expect(err).to.be.null;
        expect(stream).to.be.ok;

        stream.pipe(process.stdout, {end: true});

        stream.on('end', function() {
          done();
        });
      }

      docker.createImage({fromImage: testImage}, handler);
    });
  });

  describe("#listContainers", function() {
    it("should list containers", function(done) {
      this.timeout(5000);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.a('array');
        done();
      }

      docker.listContainers({all: 1}, handler);
    });
  });

  describe("#listImages", function() {
    it("should list images", function(done) {
      this.timeout(5000);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.a('array');
        done();
      }

      docker.listImages({all: 1}, handler);
    });
  });

  describe("#listVolumes", function() {
    it("should list volumes", function(done) {
      this.timeout(5000);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.a('object');
        expect(data.Volumes).to.be.a('array');
        done();
      }

      docker.listVolumes({}, handler);
    });
  });

  describe("#listNetworks", function() {
    it("should list networks", function(done) {
      this.timeout(5000);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.a('array');
        done();
      }

      docker.listNetworks({}, handler);
    });
  });


  describe("#version", function() {
    it("should return version", function(done) {
      this.timeout(5000);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.ok;
        done();
      }

      docker.version(handler);
    });
  });

  describe("#searchImages", function() {
    it("should return search results", function(done) {
      this.timeout(120000);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.a('array');
        done();
      }

      docker.searchImages({term: 'node'}, handler);
    });
  });

  describe("#info", function() {
    it("should return system info", function(done) {
      this.timeout(5000);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.ok;
        done();
      }

      docker.info(handler);
    });
  });
});
