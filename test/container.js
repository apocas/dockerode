/*jshint -W030 */

var expect = require('chai').expect;
var docker = require('./spec_helper').docker;
var MemoryStream = require('memorystream');
var Socket = require('net').Socket;

describe("#container", function() {

  var testContainer;
  before(function(done) {
    docker.createContainer({
      Image: 'ubuntu',
      AttachStdin: false,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
      Cmd: ['/bin/bash', '-c', 'tail -f /etc/resolv.conf'],
      OpenStdin: false,
      StdinOnce: false
    }, function(err, container) {
      if (err) done(err);
      testContainer = container.id;
      console.log('Created test container ' + container.id);
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

    it("should inspect a container with opts", function(done) {
      var container = docker.getContainer(testContainer);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.ok;
        done();
      }

      container.inspect({}, handler);
    });
  });

  describe("#archive", function() {
    it("should get an archive inside the container", function(done) {
      var container = docker.getContainer(testContainer);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.ok;
        done();
      }

      container.getArchive({
        'path': '/etc/resolv.conf'
      }, handler);
    });

    it("should put an archive inside the container", function(done) {
      var container = docker.getContainer(testContainer);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.ok;
        done();
      }

      container.putArchive('./test/test.tar', {
        'path': '/root'
      }, handler);
    });

    it("should inspect an archive inside the container", function(done) {
      var container = docker.getContainer(testContainer);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.ok;
        done();
      }

      container.infoArchive({
        'path': '/root/Dockerfile'
      }, handler);
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

  describe("#checkpoints", function() {
    before(function() {
      if(process.platform === 'darwin' || 'TRAVIS' in process.env && 'CI' in process.env) {
        this.skip();
      }
    });

    it("should create container checkpoint", function(done) {
      var container = docker.getContainer(testContainer);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.ok;
        done();
      }

      container.createCheckpoint({
        'checkpointID': 'testCheckpoint'
      }, handler);
    });

    it("should list containers checkpoints", function(done) {
      var container = docker.getContainer(testContainer);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.ok;
        done();
      }

      container.listCheckpoint(handler);
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
        var opts = {
          h: process.stdout.rows,
          w: process.stdout.columns
        };
        container.resize(opts, handle);
      });
    });
  });

  describe("#update", function() {
    it("should update a container", function(done) {
      var container = docker.getContainer(testContainer);

      function handle(err, data) {
        expect(err).to.be.null;
        done();
      }

      container.update({
        'CpuShares': 512
      }, handle);
    });
  });

  describe("#stats", function() {
    it("should get container stats", function(done) {
      var container = docker.getContainer(testContainer);

      container.stats(function(err, stream) {
        expect(err).to.be.null;
        expect(stream.pipe).to.be.ok;
        done();
      });
    });
  });

  describe('#stdin', function() {
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
      'VolumesFrom': []
    };

    function randomString(length) {
      var result = '',
        chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
      for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
      return result;
    }

    /**
     * simple test that writes 1000 bytes to the "wc -c" command, that command
     * returns the number of bytes it received, so it should return 1000 for this test
     */
    it('should support attach with tty enable writing 1000 bytes', function(done) {
      this.timeout(5000);

      var size = 1000;

      function handler(err, container) {
        expect(err).to.be.null;
        expect(container).to.be.ok;

        var attach_opts = {
          stream: true,
          stdin: true,
          stdout: true,
          stderr: true
        };
        container.attach(attach_opts, function handler(err, stream) {
          expect(err).to.be.null;
          expect(stream).to.be.ok;

          var memStream = new MemoryStream();
          var output = '';
          memStream.on('data', function(data) {
            output += data.toString();
          });

          stream.pipe(memStream);

          container.start(function(err, data) {
            expect(err).to.be.null;

            var aux = randomString(size) + '\n\x04';
            stream.write(aux);

            container.wait(function(err, data) {
              expect(err).to.be.null;
              expect(data).to.be.ok;
              expect(+output.slice(size)).to.equal(size + 1);
              done();
            });
          });
        });
      }

      optsc.AttachStdin = true;
      optsc.Tty = true;
      optsc.OpenStdin = true;
      optsc.Cmd = ['wc', '-c'];

      docker.createContainer(optsc, handler);
    });

    it('should support attach with tty disabled writing 5000 bytes', function(done) {
      this.timeout(5000);

      var size = 5000;

      function handler(err, container) {
        expect(err).to.be.null;
        expect(container).to.be.ok;

        var attach_opts = {
          stream: true,
          stdin: true,
          stdout: true,
          stderr: true
        };
        container.attach(attach_opts, function handler(err, stream) {
          expect(err).to.be.null;
          expect(stream).to.be.ok;

          var memStream = new MemoryStream();
          var output = '';
          memStream.on('data', function(data) {
            output += data.toString();
          });

          stream.pipe(memStream);

          container.start(function(err, data) {
            expect(err).to.be.null;

            stream.write('printf "' + randomString(size) + '" | wc -c; exit;\n');

            container.wait(function(err, data) {
              expect(err).to.be.null;
              expect(data).to.be.ok;
              expect(parseInt(output.replace(/\D/g, ''))).to.equal(size);
              done();
            });
          });
        });
      }

      optsc.AttachStdin = false;
      optsc.Tty = false;
      optsc.OpenStdin = true;
      optsc.Cmd = ['bash'];

      docker.createContainer(optsc, handler);
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
      'VolumesFrom': []
    };

    it("should attach and wait for a container", function(done) {
      this.timeout(120000);

      function handler(err, container) {
        expect(err).to.be.null;
        expect(container).to.be.ok;

        container.attach({
          stream: true,
          stdout: true,
          stderr: true
        }, function handler(err, stream) {
          expect(err).to.be.null;
          expect(stream).to.be.ok;

          var memStream = new MemoryStream();
          var output = '';
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

        var attach_opts = {
          stream: true,
          stdin: true,
          stdout: true,
          stderr: true
        };
        container.attach(attach_opts, function handler(err, stream) {
          expect(err).to.be.null;
          expect(stream).to.be.ok;
          expect(stream).to.not.be.an.instanceof(Socket);

          var memStream = new MemoryStream();
          var output = '';
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
    });

    it("should support attach with hijack and stdin enable", function(done) {
      this.timeout(120000);

      function handler(err, container) {
        expect(err).to.be.null;
        expect(container).to.be.ok;

        var attach_opts = {
          stream: true,
          hijack: true,
          stdin: true,
          stdout: true,
          stderr: true
        };
        container.attach(attach_opts, function handler(err, stream) {
          expect(err).to.be.null;
          expect(stream).to.be.an.instanceof(Socket);

          var memStream = new MemoryStream();
          var output = '';
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
    });
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
        'ubuntu', ['/bin/bash', '-c', 'echo "xfoo" > foo.txt'],
        null,
        function(err, result, subject) {
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

  describe("#logs", function() {

    it("should get the logs for a container as a stream", function(done) {
      this.timeout(30000);
      var container = docker.getContainer(testContainer);
      var logs_opts = {
        follow: true,
        stdout: true,
        stderr: true,
        timestamps: true
      };

      function handler(err, stream) {
        expect(err).to.be.null;
        expect(stream.pipe).to.be.ok;
        done();
      }

      container.logs(logs_opts, handler);

    });
  });

  describe("#exec", function() {
    it("should run exec on a container", function(done) {
      this.timeout(20000);
      var options = {
        Cmd: ["echo", "'foo'"]
      };

      var container = docker.getContainer(testContainer);

      function handler(err, exec) {
        expect(err).to.be.null;

        exec.start(function(err, stream) {
          expect(err).to.be.null;
          expect(stream.pipe).to.be.ok;

          exec.inspect(function(err, data) {
            expect(err).to.be.null;
            expect(data).to.be.ok;

            done();
          });
        });
      }

      container.exec(options, handler);
    });

    it("should run resolve exec promise with a stream", function(done) {
      this.timeout(20000);
      var options = {
        Cmd: ["echo", "'foo'"]
      };

      var container = docker.getContainer(testContainer);

      function handler(err, exec) {
        expect(err).to.be.null;

        exec.start()
          .then(stream => {
            expect(stream.pipe).to.be.ok;
            done();
          })
          .catch(done);
      }

      container.exec(options, handler);
    });

    it("should allow exec stream hijacking on a container", function(done) {
      this.timeout(20000);
      var options = {
        Cmd: ["cat"],
        AttachStdin: true,
        AttachStdout: true,
      };
      var startOpts = {
        hijack: true
      };

      var container = docker.getContainer(testContainer);

      function handler(err, exec) {
        expect(err).to.be.null;

        exec.start(startOpts, function(err, stream) {
          expect(err).to.be.null;
          //expect(stream).to.be.ok;
          expect(stream).to.be.an.instanceof(Socket);
          //return done();

          var SAMPLE = 'echo\nall\nof\nme\n';
          var bufs = [];
          stream.on('data', function(d) {
            bufs.push(d);
          }).on('end', function() {
            var out = Buffer.concat(bufs);
            expect(out.readUInt8(0)).to.equal(1);
            expect(out.readUInt32BE(4)).to.equal(SAMPLE.length);
            expect(out.toString('utf8', 8)).to.equal(SAMPLE);
            done();
          });
          stream.end(SAMPLE);
          //stream.end();
        });
      }

      container.exec(options, handler);
    });
  });

  describe("#commit", function() {
    it("should commit a container", function(done) {
      this.timeout(30000);
      var container = docker.getContainer(testContainer);

      function handler(err, stream) {
        expect(err).to.be.null;
        expect(stream).to.be.ok;
        done();
      }

      container.commit({
        comment: 'dockerode commit test'
      }, handler);
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

describe("#non-responsive container", function() {

  var testContainer;
  before(function(done) {
    docker.createContainer({
      Image: 'ubuntu',
      AttachStdin: false,
      AttachStdout: true,
      AttachStderr: true,
      Tty: true,
      Cmd: ['/bin/sh', '-c', "trap 'echo no' TERM; while true; do sleep 1; done"],
      OpenStdin: false,
      StdinOnce: false
    }, function(err, container) {
      if (err) done(err);
      testContainer = container.id;
      done();
    });
  });

  describe("#restart", function() {
    it("forced after timeout", function(done) {
      this.timeout(30000);
      var container = docker.getContainer(testContainer);

      function handler(err, data) {
        expect(err).to.be.null;
        done();
      }

      container.restart({
        t: 10
      }, handler);
    });
  });

  describe("#stop", function() {
    it("forced after timeout", function(done) {
      this.timeout(30000);
      var container = docker.getContainer(testContainer);

      function handler(err, data) {
        expect(err).to.be.null;
        done();
      }

      container.stop({
        t: 10
      }, handler);
    });
  });

});
