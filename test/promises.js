/*jshint -W030 */

var expect = require('chai').expect;
var docker = require('./spec_helper').docker;
var dockerp = require('./spec_helper').dockerp;
var MemoryStream = require('memorystream');
var Socket = require('net').Socket;

var testImage = 'ubuntu:14.04';

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

      docker.createContainer({
        Image: 'ubuntu',
        AttachStdin: false,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        Cmd: ['/bin/bash', '-c', 'tail -f /var/log/dmesg'],
        OpenStdin: false,
        StdinOnce: false
      }).then(function(container) {
        return container.start();
      }).then(function(container) {
        return container.resize({
          h: process.stdout.rows,
          w: process.stdout.columns
        });
      }).then(function(container) {
        return container.stop();
      }).then(function(container) {
        return container.remove();
      }).then(function(data) {
        done();
      }).catch(function(err) {
        expect(err).to.be.null;
        done();
      });
    });

    it("should runPromise a command", function(done) {
      this.timeout(30000);

      docker.run(testImage, ['bash', '-c', 'uname -a'], process.stdout).then(function(container) {
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

      dockerp.createContainer({
        Image: 'ubuntu',
        AttachStdin: false,
        AttachStdout: true,
        AttachStderr: true,
        Tty: true,
        Cmd: ['/bin/bash', '-c', 'tail -f /var/log/dmesg'],
        OpenStdin: false,
        StdinOnce: false
      }).then(function(container) {
        return container.start();
      }).then(function(container) {
        return container.stop();
      }).then(function(container) {
        return container.remove();
      }).then(function(data) {
        done();
      }).catch(function(err) {
        expect(err).to.be.null;
        done();
      });
    });
  });

});
