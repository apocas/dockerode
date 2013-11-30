var Docker = require('../lib/docker');
var expect = require('chai').expect;

var testContainer = '';

var docker = new Docker({socketPath: '/var/run/docker.sock'});

describe("#container", function() {

  before(function(done){
    expect(testContainer).to.not.have.length(0);
    done();
  });

  describe("#inspect", function() {
    it("should inspect a container", function(done) {
      //this.timeout(10000);

      var container = docker.getContainer(testContainer);

      function handler(err, data) {
        expect(err).to.be.null;
        //console.log(data);
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
        //console.log(data);
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
        
     
        container.attach({stream: true, stdout: true, stderr: true}, function handler(err, stream) {
          expect(err).to.be.null;

          stream.setEncoding('utf8');
          stream.pipe(process.stdout, {end: false});

          container.start(function(err, data) {
            expect(err).to.be.null;

            container.wait(function(err, data) {
              expect(err).to.be.null;
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
        'Tty': true,
        'OpenStdin': false,
        'StdinOnce': false,
        'Env': null,
        'Cmd': ['bash', '-c', 'uptime'],
        'Dns': ['8.8.8.8', '8.8.4.4'],
        'Image': 'ubuntu',
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
        //console.log(data);
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
        //console.log(data);
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
        //console.log(data);
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
        //console.log(data);
        done();
      }

      container.stop(handler);
    });
  });
});