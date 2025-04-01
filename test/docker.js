/*jshint -W030 */

var Bluebird = require('bluebird'),
  expect = require('chai').expect,
  assert = require('assert'),
  path = require('path'),
  Docker = require('../lib/docker');

var docker = require('./spec_helper').docker;
var dockert = require('./spec_helper').dockert;


var testImage = 'ubuntu:latest';
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
    it("should use specific cert", function(done) {
      process.env.DOCKER_CERT_PATH = '/thereisnofolder';
      var ca = 'caaaaa';
      var cert = 'certtttt';
      var key = 'keyyyyy';
      var d = new Docker({
        version: 'v1.39',
        host: '127.0.0.1',
        port: 2376,
        ca,
        cert,
        key
      });

      assert.strictEqual(ca, d.modem.ca);
      assert.strictEqual(cert, d.modem.cert);
      assert.strictEqual(key, d.modem.key);
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

    it("should build image from file using Promise", function(done) {
      this.timeout(60000);

      docker.buildImage('./test/test.tar', {}).then((stream) => {
        expect(stream).to.be.ok;

        stream.pipe(process.stdout, {
          end: true
        });

        stream.on('end', function() {
          done();
        });
      })
      .catch(error => done(error))
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
      }, { t: 'multiple-files' }, handler);
    });

    it("should build image from multiple files using cache", function(done) {
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
      }, { t: 'multiple-files-cachefrom', 'cachefrom': ['ubuntu:latest'] }, handler);
    });

    it("should build image from multiple files while respecting the .dockerignore file", function(done) {
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
        context: path.join(__dirname, 'fixtures', 'dockerignore'),
        src: ['Dockerfile', 'MC-hammer.txt', 'ignore-dir', 'foo.txt']
      }, { t: 'honor-dockerignore' }, handler);
    });

    it("should build image from multiple files while respecting the dockerignore file", function(done) {
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
        src: ['Dockerfile', '.dockerignore', 'test.tar']
      }, {}, handler);
    });

    it("should build image from multiple files while respecting the dockerignore file via Promise", function(done) {
      this.timeout(60000);

      docker.buildImage({
        context: __dirname,
        src: ['Dockerfile', '.dockerignore', 'test.tar']
      }, {}).then((stream) => {
        expect(stream).to.be.ok;

        stream.pipe(process.stdout, {
          end: true
        });

        stream.on('end', function() {
          done();
        });
      })
      .catch(error => done(error))
    });

    it("should not mutate src array", function(done) {
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

      const src = ['Dockerfile']
      docker.buildImage({
        context: __dirname,
        src: src
      }, {}, handler);

      expect(src).to.contain('Dockerfile');
    });

    it("should build image with buildKit", function (done) {
      this.timeout(60000);
      const randomId = Math.random().toString(36).substring(7);

      function handler(err, stream) {
        expect(err).to.be.null;
        expect(stream).to.be.ok;

        stream.pipe(process.stdout, {
          end: true,
        });

        stream.on("end", function () {
          docker.getImage(randomId).inspect(undefined, (err, image) => {
            expect(err).to.be.null;
            expect(image).to.exist;
            done();
          });
        });
      }

      docker.buildImage(
        {
          context: __dirname,
          src: ["buildkit.Dockerfile"],
        },
        {
          dockerfile: "buildkit.Dockerfile",
          version: "2",
          t: randomId,
          pull: "true",
        },
        handler
      );
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
          if (list[i].RepoTags && list[i].RepoTags.indexOf(repoTag) !== -1) {
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
          expect(output).to.be.a('array');
          done();
        }

        function onProgress(event) {
          expect(event).to.be.ok;
          stream.destroy();
        }
      });
    });
  });

  describe("#run", function() {
    this.timeout(30000);

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

    it("should emit partial data", function(done) {
      function handler(err, data, container) {
        expect(err).to.be.null;
        //container is created
        expect(container).to.be.ok;

        container.remove(function(err, data) {
          expect(err).to.be.null;
        });
      }

      var ee = docker.run(testImage, ['bash', '-c', 'uname -a; sleep 5'], process.stdout, handler);
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

    it("should create and remove a default volume", function(done) {
      this.timeout(5000);

      function handler(err, volume) {
        expect(err).to.be.null;
        expect(volume).to.be.ok;

        volume.inspect(function(err, info) {
          expect(err).to.be.null;

          volume.remove(function(err, data) {
            expect(err).to.be.null;
            done();
          });
        });
      }

      docker.createVolume({}, handler);
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

  describe("#df", function() {
    it("should return df", function(done) {
      this.timeout(5000);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.ok;
        done();
      }

      docker.df(handler);
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
          expect(info.Config.Labels).to.deep.include(label_map);
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
