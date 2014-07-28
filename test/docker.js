var expect = require('chai').expect;
var docker = require('./spec_helper').docker;

describe("#docker", function() {

  describe("#checkAuth", function() {
    it("should fail auth", function(done) {
      this.timeout(5000);

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

  describe('#pull', function() {
    this.timeout(120000);

    // one image with one tag
    var repoTag = 'ubuntu:latest';

    // XXX: Should this be an extra abstraction in docker.js?
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

    beforeEach(function(done) {
      locateImage(repoTag, function(err, image) {
        if (err) return done(err);
        if (image) return image.remove(done);
        done();
      });
    });

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
        // XXX: Do we want the full stream in the test?
        stream.pipe(process.stdout);
        stream.once('end', handler);
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

      var ee = docker.run('ubuntu', ['bash', '-c', 'uname -a'], process.stdout, handler);
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

      docker.run('ubuntu', ['bash', '-c', 'uname -a'], process.stdout, handler);
    });

    it("should run a command with options", function(done){
      function handler(err, data, container) {
        expect(err).to.be.null;
        
        container.inspect(function(err,data){
          expect(err).to.be.null;
          expect(data.HostConfig.Privileged).to.be.true;

          container.remove(function(err,data){
            expect(err).to.be.null;
            done();
          });
        });
      }
      docker.run('ubuntu', ['bash', '-c', 'uname -a'], process.stdout, {Privileged : true}, handler);
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
        });

        container.remove(function(err, data) {
          expect(err).to.be.null;
          done();
        });
      }

      docker.createContainer({Image: 'ubuntu', Cmd: ['/bin/bash'], name: 'test'}, handler);
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

      docker.createImage({fromImage: 'ubuntu'}, handler);
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
