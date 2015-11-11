/*jshint -W030 */

var expect = require('chai').expect;
var docker = require('./spec_helper').docker;
var MemoryStream = require('memorystream');

describe("#networks", function() {

  var testContainer;
  before(function(done) {
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
      container.start(function(err, result) {
        if (err) done(err);
        done();
      });
    });
  });
  after(function(done) {
    this.timeout(15000);
    var container = docker.getContainer(testContainer);
    container.kill(function(err, result) {
      if (err) done(err);
      container.remove(function(err, result) {
        if (err) done(err);
        done();
      });
    });
  });

  var testNetwork;
  before(function(done) {
    docker.createNetwork({
      "Name": "isolated_nw",
      "Driver": "bridge",
      "IPAM": {
        "Config": [{
          "Subnet": "172.20.0.0/16",
          "IPRange": "172.20.10.0/24",
          "Gateway": "172.20.10.11"
      }]
      }
    }, function(err, network) {
      if (err) done(err);
      testNetwork = network;
      done();
    });
  });
  after(function(done) {
    testNetwork.remove(function(err, result) {
      if (err) done(err);
      done();
    });
  });

  describe("#connect", function() {
    it("should connect a container to a network", function(done) {
      var network = testNetwork;
      var container = testContainer;

      function handler(err, data) {
        expect(err).to.be.null;
        done();
      }

      network.connect({
        Container: container
      }, handler);
    });
  });

  describe("#inspect", function() {
    it("should inspect a network", function(done) {
      var network = testNetwork;

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.ok;
        expect(data.Containers).to.not.be.null;
        done();
      }

      network.inspect(handler);
    });
  });

  describe("#disconnect", function() {
    it("should disconnect a container to a network", function(done) {
      var network = testNetwork;
      var container = testContainer;

      function handler(err, data) {
        expect(err).to.be.null;
        done();
      }

      network.disconnect({
        Container: container
      }, handler);
    });
  });

});