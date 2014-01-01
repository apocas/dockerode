var Docker = require('../lib/docker');
var expect = require('chai').expect;


var docker = new Docker({socketPath: '/var/run/docker.sock'});

describe("#container", function() {

  var testContainer;
  before(function(done){
    docker.createContainer({
      Image: 'ubuntu',
      AttachStdin: false,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
      Cmd: ['/bin/bash', '-c', 'exit 1'],
      OpenStdin: false,
      StdinOnce: false
    }, function(err, container) {
      if (err) done(err);
      testContainer = container.id;
      done();
    });
  });

  describe("#inspect", function() {
    it("should inspect a container", function(done) {
      var container = docker.getContainer(testContainer);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.ok;
        done();
      }

      container.inspect(handler);
    });
  });

  describe("#start", function() {
    it("should start a container", function(done) {
      var container = docker.getContainer(testContainer);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.ok;
        done();
      }

      container.start(handler);
    });
  });

  describe("#attach", function() {
    it("should attach and wait for a container", function(done) {
      this.timeout(120000);

      function handler(err, container) {
        expect(err).to.be.null;
        expect(container).to.be.ok;
     
        container.attach({stream: true, stdout: true, stderr: true}, function handler(err, stream) {
          expect(err).to.be.null;
          expect(stream).to.be.ok;

          container.modem.demuxStream(stream, process.stdout, process.stdout, process.stdout);

          container.start(function(err, data) {
            expect(err).to.be.null;
            expect(data).to.be.ok;

            container.wait(function(err, data) {
              expect(err).to.be.null;
              expect(data).to.be.ok;
              done();
            });
          });
        });

      }

      var optsc = {
        'Hostname': '',
        'User': '',
        'AttachStdin': false,
        'AttachStdout': true,
        'AttachStderr': true,
        'Tty': false,
        'OpenStdin': false,
        'StdinOnce': false,
        'Env': null,
        'Cmd': ['bash', '-c', 'uptime'],
        'Dns': ['8.8.8.8', '8.8.4.4'],
        'Image': 'base',
        'Volumes': {},
        'VolumesFrom': ''
      };

      docker.createContainer(optsc, handler);
    });
  });

  describe("#restart", function() {
    it("should restart a container", function(done) {
      this.timeout(30000);
      var container = docker.getContainer(testContainer);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.ok;
        done();
      }

      container.restart(handler);
    });
  });

  describe("#export", function() {
    it("should export a container", function(done) {
      this.timeout(30000);
      var container = docker.getContainer(testContainer);

      function handler(err, stream) {
        expect(err).to.be.null;
        expect(stream).to.be.ok;
        done();
      }

      container.export(handler);
    });
  });

  describe("#top", function() {
    it("should return top", function(done) {
      this.timeout(10000);
      var container = docker.getContainer(testContainer);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.ok;
        done();
      }

      container.top(handler);
    });
  });

  describe("#changes", function() {
    it("should container changes", function(done) {
      this.timeout(10000);
      var container = docker.getContainer(testContainer);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.ok;
        done();
      }

      container.changes(handler);
    });
  });

  describe("#stop", function() {
    it("should stop a container", function(done) {
      this.timeout(30000);
      var container = docker.getContainer(testContainer);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.ok;
        done();
      }

      container.stop(handler);
    });
  });
});