var expect = require('chai').expect;
var docker = require('./spec_helper').docker;
var MemoryStream = require('memorystream');

describe("#container", function() {

  var testContainer;
  before(function(done){
    docker.createContainer({
      Image: 'ubuntu',
      AttachStdin: false,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
      Cmd: ['/bin/bash', '-c', 'tail -f /var/log/dmesg'],
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
      this.timeout(60000);

      var container = docker.getContainer(testContainer);

      function handler(err, data) {
        expect(err).to.be.null;
        done();
      }

      container.start(handler);
    });
  });

  describe("#resize", function() {
    it("should resize tty a container", function(done) {
      var container = docker.getContainer(testContainer);

      function handle(err, data) {
        expect(err).to.be.null;
        done();
      }

      container.start(function(err, data) {
        var opts = {h: process.stdout.rows, w: process.stdout.columns};
        container.resize(opts, handle);
      });
    });
  });

  describe("#attach", function() {
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
      'Cmd': ['/bin/bash', '-c', 'uptime'],
      'Dns': ['8.8.8.8', '8.8.4.4'],
      'Image': 'ubuntu',
      'Volumes': {},
      'VolumesFrom': ''
    };


    it("should attach and wait for a container", function(done) {
      this.timeout(120000);

      function handler(err, container) {
        expect(err).to.be.null;
        expect(container).to.be.ok;

        container.attach({stream: true, stdout: true, stderr: true}, function handler(err, stream) {
          expect(err).to.be.null;
          expect(stream).to.be.ok;

          var memStream = new MemoryStream();
          var output    = '';
          memStream.on('data', function(data) {
            output += data.toString();
          });

          container.modem.demuxStream(stream, memStream, memStream);

          container.start(function(err, data) {
            expect(err).to.be.null;

            container.wait(function(err, data) {
              expect(err).to.be.null;
              expect(data).to.be.ok;
              expect(output).to.match(/.*users.*load average.*/);
              done();
            });
          });
        });

      }

      optsc.AttachStdin = false;
      optsc.OpenStdin = false;
      optsc.Cmd = ['bash', '-c', 'uptime'];

      docker.createContainer(optsc, handler);
    });

    it("should support attach with stdin enable", function(done) {
      this.timeout(120000);

      function handler(err, container) {
        expect(err).to.be.null;
        expect(container).to.be.ok;

        var attach_opts = {stream: true, stdin: true, stdout: true, stderr: true};
        container.attach(attach_opts, function handler(err, stream) {
          expect(err).to.be.null;
          expect(stream).to.be.ok;

          var memStream = new MemoryStream();
          var output    = '';
          memStream.on('data', function(data) {
            output += data.toString();
          });

          stream.pipe(memStream);

          container.start(function(err, data) {
            expect(err).to.be.null;

            stream.write("uptime; exit\n");

            container.wait(function(err, data) {
              expect(err).to.be.null;
              expect(data).to.be.ok;
              expect(output).to.match(/.*users.*load average.*/);
              done();
            });
          });
        });
      }

      optsc.AttachStdin = true;
      optsc.OpenStdin = true;
      optsc.Cmd = ['bash'];

      docker.createContainer(optsc, handler);
    })
  });

  describe("#restart", function() {
    it("should restart a container", function(done) {
      this.timeout(30000);
      var container = docker.getContainer(testContainer);

      function handler(err, data) {
        expect(err).to.be.null;
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
    this.timeout(10000);

    var container;
    beforeEach(function(done) {
      docker.run(
        'ubuntu',
        ['/bin/bash', '-c', 'echo "xfoo" > foo.txt'],
        null,
        function (err, result, subject) {
          // subject is the resulting container from the operation
          container = subject;
          done(err);
        }
      );
    });

    afterEach(function(done) {
      container.remove(done);
    });

    it("should container changes", function(done) {
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
        done();
      }

      container.stop(handler);
    });
  });
});
