/*jshint -W030 */

var expect = require('chai').expect;
var docker = require('./spec_helper').dockerp;
var MemoryStream = require('memorystream');
var Socket = require('net').Socket;

describe("#container promises", function() {

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

});
