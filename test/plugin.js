/*jshint -W030 */

var expect = require('chai').expect;
var docker = require('./spec_helper').docker;


describe("#plugin", function() {

  describe("#listPlugins", function() {
    it("should list plugins", function(done) {
      this.timeout(5000);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.a('array');
        done();
      }

      docker.listPlugins({}, handler);
    });
  });

  describe("#install", function() {

    it("should get plugin privileges", function(done) {
      this.timeout(15000);
      var plugin = docker.getPlugin('sshfs', 'vieux/sshfs');

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.a('array');
        console.log(data);
        done();
      }

      plugin.privileges(handler);
    });

    it("should pull a plugin", function(done) {
      this.timeout(60000);

      var plugin = docker.getPlugin('sshfs');

      //geezzz url, querystring and body...
      plugin.install({
        '_query': {
          'remote': 'vieux/sshfs'
        },
        '_body': [{
          'Name': 'network',
          'Description': '',
          'Value': [
            'host'
          ]
        }, {
          'Name': 'capabilities',
          'Description': '',
          'Value': [
            'CAP_SYS_ADMIN'
          ]
        }, {
          'Name': 'mount',
          'Description': '',
          'Value': [
            '/var/lib/docker/plugins/'
          ]
        }, {
          'Name': 'device',
          'Description': '',
          'Value': [
            '/dev/fuse'
          ]
        }]
      }, function(err, stream) {
        if (err) return done(err);
        stream.pipe(process.stdout);
        stream.once('end', done);
      });

    });

    it("should enable a plugin", function(done) {
      this.timeout(15000);
      var plugin = docker.getPlugin('sshfs');

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.ok;
        done();
      }

      plugin.enable(handler);
    });

    it("should disable a plugin", function(done) {
      this.timeout(15000);
      var plugin = docker.getPlugin('sshfs');

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.ok;
        done();
      }

      plugin.disable(handler);
    });

    it("should remove a plugin", function(done) {
      this.timeout(15000);
      var plugin = docker.getPlugin('sshfs');

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.ok;
        done();
      }

      plugin.remove(handler);
    });
  });
});
