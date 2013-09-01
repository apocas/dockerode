var Docker = require('../lib/docker');
var expect = require('chai').expect;

var docker = new Docker({socketPath: '/var/run/docker.sock'});

describe("#docker", function() {

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

      docker.run('ubuntu', 'uname -a', process.stdout, true, handler);
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

      docker.createContainer({Image: 'ubuntu', Cmd: ['/bin/bash']}, handler);
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

      docker.createImage({fromImage: 'ubuntu'}, handler);
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