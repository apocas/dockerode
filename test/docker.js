var Docker = require('../lib/docker');
var expect = require('chai').expect;

var docker = new Docker({socketPath: '/var/run/docker.sock'});

describe("#docker", function() {

  describe("#checkAuth", function() {
    it("should fail auth", function(done) {
      this.timeout(5000);

      function handler(err, data) {
        expect(err).not.to.be.null;

        //console.log(data);
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

        stream.pipe(process.stdout, {end: true});

        stream.on('end', function() {
          done();
        });
      }

      docker.buildImage('./test/test.tar', {}, handler);
    });
  });

  describe("#getEvents", function() {
    it("should get events", function(done) {
      this.timeout(30000);

      function handler(err, stream) {
        expect(err).to.be.null;
        //stream.pipe(process.stdout, {end: true});
        done();
      }

      docker.getEvents({since: ((new Date().getTime()/1000) - 60).toFixed(0)}, handler);
    });
  });

  describe("#run", function() {
    it("should run a command", function(done) {
      this.timeout(30000);

      function handler(err, data) {
        expect(err).to.be.null;
        console.log(data);
        done();
      }

      docker.run('base', ['bash', '-c', 'uname -a'], process.stdout, true, handler);
    });
  });

  describe("#createContainer", function() {
    it("should create and remove a container", function(done) {
      this.timeout(5000);

      function handler(err, container) {
        expect(err).to.be.null;
        //console.log('created: ' + container.id);
        container.remove(function(err, data) {
          expect(err).to.be.null;
          done();
        });
      }

      docker.createContainer({Image: 'base', Cmd: ['/bin/bash']}, handler);
    });
  });

  describe("#createImage", function() {
    it("should create an image", function(done) {
      this.timeout(120000);

      function handler(err, stream) {
        expect(err).to.be.null;

        stream.pipe(process.stdout, {end: true});

        stream.on('end', function() {
          done();
        });
      }

      docker.createImage({fromImage: 'base'}, handler);
    });
  });

  describe("#listContainers", function() {
    it("should list containers", function(done) {
      this.timeout(5000);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.a('array');
        //console.log(data);
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
        //console.log(data);
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
        //console.log(data);
        done();
      }

      docker.version(handler);
    });
  });

  describe("#searchImages", function() {
    it("should return search results", function(done) {
      this.timeout(10000);

      function handler(err, data) {
        expect(err).to.be.null;
        //console.log(data);
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
        //console.log(data);
        done();
      }

      docker.info(handler);
    });
  });
});