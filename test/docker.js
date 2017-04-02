/*jshint -W030 */

var Bluebird = require('bluebird'),
  expect = require('chai').expect,
  Docker = require('../lib/docker');

var docker = require('./spec_helper').docker;
var dockert = require('./spec_helper').dockert;


var testImage = 'ubuntu:14.04';
var testVolume = {
  "Name": "tardis",
  "Driver": "local",
  "Mountpoint": "/var/lib/docker/volumes/tardis"
};

describe("#docker", function() {

  describe("#constructors", function()  {
    it("should work without options", function(done) {
      var d = new Docker();
      expect(d.modem.socketPath).not.to.be.null;
      done();
    });
    it("should not send Promise options to docker-modem", function(done) {
      var d = new Docker({
        'Promise': Bluebird
      });
      expect(d.modem.socketPath).not.to.be.null;
      done();
    });
  });

  describe("#checkAuth", function() {
    it("should fail auth", function(done) {
      this.timeout(15000);

      function handler(err, data) {
        expect(err).not.to.be.null;
        done();
      }

      docker.checkAuth({
        username: 'xpto',
        password: 'dang',
        email: 'xpto@pxpto.pt'
      }, handler);
    });
  });

  describe("#buildImage", function() {
    it("should build image from file", function(done) {
      this.timeout(60000);

      function handler(err, stream) {
        expect(err).to.be.null;
        expect(stream).to.be.ok;

        stream.pipe(process.stdout, {
          end: true
        });

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

        stream.pipe(process.stdout, {
          end: true
        });

        stream.on('end', function() {
          done();
        });
      }

      var data = require('fs').createReadStream('./test/test.tar');
      docker.buildImage(data, handler);
    });

    it("should build image from multiple files", function(done) {
      this.timeout(60000);

      function handler(err, stream) {
        expect(err).to.be.null;
        expect(stream).to.be.ok;

        stream.pipe(process.stdout, {
          end: true
        });

        stream.on('end', function() {
          done();
        });
      }

      docker.buildImage({
        context: __dirname,
        src: ['Dockerfile']
      }, {}, handler);
    });

    it("should return Promise when building image", function(done) {
      this.timeout(60000);
      var promise = docker.buildImage({
        context: __dirname,
        src: ['Dockerfile']
      });
      expect(promise.then).to.not.be.null;
      expect(promise.catch).to.not.be.null;
      done();
    });
  });


  describe("#loadImage", function() {
    it("should load image from readable stream", function(done) {
      this.timeout(60000);

      function handler(err, stream) {
        expect(err).to.be.null;
        expect(stream).to.be.ok;

        stream.pipe(process.stdout, {
          end: true
        });

        stream.on('end', function() {
          done();
        });
      }

      // test-save.tar => 'docker save hello-world > ./test/test-save.tar
      var data = require('fs').createReadStream('./test/test-load.tar');
      docker.loadImage(data, {}, handler);
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

      docker.getEvents({
        since: ((new Date().getTime() / 1000) - 60).toFixed(0)
      }, handler);
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

      dockert.searchImages({
        term: 'node'
      }, handler);
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
          done();
        }

        function onProgress(event) {
          stream.destroy();
          expect(event).to.be.ok;
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
      ee.on('container', function(container) {
        expect(container).to.be.ok;
      });
      ee.on('stream', function(stream) {
        expect(stream).to.be.ok;
      });
      ee.on('start', function(container) {
        expect(container).to.be.ok;
        container.inspect(function(err, info) {
          expect(info.State.Status).to.equal('running');
        });
      });
      ee.on('data', function(data) {
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

    it("should run a command with create options", function(done) {
      function handler(err, data, container) {
        expect(err).to.be.null;

        container.inspect(function(err, data) {
          expect(err).to.be.null;

          container.remove(function(err, data) {
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

        volume.inspect(function(err, info) {
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

  describe("#createContainer", function() {
    it("should create and remove a container", function(done) {
      this.timeout(5000);

      function handler(err, container) {
        expect(err).to.be.null;
        expect(container).to.be.ok;

        container.inspect(function(err, info) {
          expect(err).to.be.null;
          expect(info.Name).to.equal('/test');

          container.remove(function(err, data) {
            expect(err).to.be.null;
            done();
          });
        });
      }

      docker.createContainer({
        Image: testImage,
        Cmd: ['/bin/bash'],
        name: 'test'
      }, handler);
    });
  });

  describe("#createImage", function() {
    it("should create an image", function(done) {
      this.timeout(120000);

      function handler(err, stream) {
        expect(err).to.be.null;
        expect(stream).to.be.ok;

        stream.pipe(process.stdout, {
          end: true
        });

        stream.on('end', function() {
          done();
        });
      }

      docker.createImage({
        fromImage: testImage
      }, handler);
    });
  });

  describe("#importImage", function() {
    it("should import an image from a tar archive", function(done) {
      this.timeout(120000);

      function handler(err, stream) {
        expect(err).to.be.null;
        expect(stream).to.be.ok;

        stream.pipe(process.stdout, {
          end: true
        });

        stream.on('end', function() {
          done();
        });
      }
      var data = require('fs').createReadStream('./test/empty.tar');
      docker.importImage(data, handler);
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

      docker.listContainers({
        all: 1
      }, handler);
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

      docker.listImages({
        all: 1
      }, handler);
    });
  });

  describe("#listVolumes", function() {
    it("should list volumes", function(done) {
      this.timeout(5000);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.a('object');
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

      docker.searchImages({
        term: 'node'
      }, handler);
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

  describe("#labelsAndFilters", function() {
    var created_containers = [];

    // after fn to cleanup created containers after testsuite execution
    after(function(done) {
      this.timeout(10000);
      if (!created_containers.length) return done();
      created_containers.forEach(function(container, index) {
        container.remove(function(err, data) {
          if (index === created_containers.length - 1) return done(err);
        });
      });
    });

    // helper fn to create labeled containers and verify through inspection
    var createLabledContainer = function(label_map, callback) {
      function handler(err, container) {
        expect(err).to.be.null;
        expect(container).to.be.ok;
        created_containers.push(container);

        container.inspect(function(err, info) {
          expect(err).to.be.null;
          expect(info.Config.Labels).to.deep.equal(label_map);
          callback();
        });
      }

      docker.createContainer({
        "Image": testImage,
        "Cmd": ['/bin/bash'],
        "Labels": label_map
      }, handler);
    };

    it("should create a container with an empty value label", function(done) {
      this.timeout(5000);
      createLabledContainer({
        "dockerode-test-label": ""
      }, done);
    });

    it("should create a container with an assigned value label", function(done) {
      this.timeout(5000);
      createLabledContainer({
        "dockerode-test-label": "",
        "dockerode-test-value-label": "assigned"
      }, done);
    });

    it("should query containers filtering by valueless labels", function(done) {
      docker.listContainers({
        "limit": 3,
        "filters": '{"label": ["dockerode-test-label"]}'
      }, function(err, data) {
        expect(data.length).to.equal(2);
        done();
      });
    });

    it("should query containers filtering by valued labels", function(done) {
      docker.listContainers({
        "limit": 3,
        "filters": '{"label": ["dockerode-test-label", "dockerode-test-value-label=assigned"]}'
      }, function(err, data) {
        expect(data.length).to.equal(1);
        done();
      });
    });

    it("should query containers filtering by map of valued labels", function(done) {
      docker.listContainers({
        "limit": 3,
        "filters": {
          "label": ["dockerode-test-label", "dockerode-test-value-label=assigned"]
        }
      }, function(err, data) {
        expect(data.length).to.equal(1);
        done();
      });
    });

  });
});
