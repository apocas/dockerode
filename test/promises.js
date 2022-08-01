/*jshint -W030 */

var expect = require('chai').expect;
var docker = require('./spec_helper').docker;
var dockerp = require('./spec_helper').dockerp;
var MemoryStream = require('memorystream');
var Socket = require('net').Socket;

var testImage = 'ubuntu:latest';

describe("#promises", function() {

  describe("#docker", function() {
    it("should build image from readable stream", function(done) {
      this.timeout(60000);

      var data = require('fs').createReadStream('./test/test.tar');

      docker.buildImage(data).then(function(stream) {
        expect(stream).to.be.ok;

        stream.pipe(process.stdout, {
          end: true
        });

        stream.on('end', function() {
          done();
        });
      }).catch(function(err) {
        expect(err).to.be.null;
        done();
      });
    });
  });

  it("should build image from multiple files", function(done) {
    this.timeout(60000);

    docker.buildImage({
      context: __dirname,
      src: ['Dockerfile']
    }).then(function(stream) {
      expect(stream).to.be.ok;

      stream.pipe(process.stdout, {
        end: true
      });

      stream.on('end', function() {
        done();
      });
    }).catch(function(err) {
      expect(err).to.be.null;
      done();
    });
  });

  describe("#container", function() {
    it("should start->resize->stop->remove a container", function(done) {
      this.timeout(60000);

      var containeri;

      docker.createContainer({
        Image: 'ubuntu',
        AttachStdin: false,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        Cmd: ['/bin/bash', '-c', 'sleep 60'],
        OpenStdin: false,
        StdinOnce: false
      }).then(function(container) {
        containeri = container;
        return containeri.start();
      }).then(function(data) {
        return containeri.resize({
          h: 10,
          w: 10
        });
      }).then(function(data) {
        return containeri.stop();
      }).then(function(data) {
        return containeri.remove();
      }).then(function(data) {
        done();
      }).catch(function(err) {
        expect(err).to.be.null;
        done();
      });
    });

    it("should runPromise a command", function(done) {
      this.timeout(30000);

      docker.run(testImage, ['bash', '-c', 'uname -a'], process.stdout).then(function(data) {
        var output = data[0];
        var container = data[1];
        expect(container).to.be.ok;
        return container.remove();
      }).then(function(data) {
        done();
      }).catch(function(err) {
        expect(err).to.be.null;
        done();
      });
    });
  });

  describe("#custom Promise (bluebird)", function() {
    it("should start->stop->remove a container with Bluebird", function(done) {
      this.timeout(60000);

      var containeri;

      dockerp.createContainer({
        Image: 'ubuntu',
        AttachStdin: false,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        Cmd: ['/bin/bash', '-c', 'tail -f /etc/resolv.conf'],
        OpenStdin: false,
        StdinOnce: false
      }).then(function(container) {
        containeri = container;
        return containeri.start();
      }).then(function(data) {
        return containeri.stop();
      }).then(function(data) {
        return containeri.remove();
      }).then(function(data) {
        done();
      }).catch(function(err) {
        expect(err).to.be.null;
        done();
      });
    });
  });

});
