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
    var installed = false;

    it("should get plugin privileges", function(done) {
      this.timeout(15000);
      var plugin = docker.getPlugin('vieux/sshfs');

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.a('array');
        done();
      }

      plugin.privileges(handler);
    });

    it("should pull a plugin", function(done) {
      this.timeout(60000);

      var plugin = docker.getPlugin('sshfs');

      //geezzz url, querystring and body...
      plugin.pull({
        '_query': {
          'remote': 'vieux/sshfs'
        },
        '_body': [{
            Name: 'network',
            Description: 'permissions to access a network',
            Value: ['host']
          },
          {
            Name: 'mount',
            Description: 'host path to mount',
            Value: ['/var/lib/docker/plugins/']
          },
          {
            Name: 'mount',
            Description: 'host path to mount',
            Value: ['']
          },
          {
            Name: 'device',
            Description: 'host device to access',
            Value: ['/dev/fuse']
          },
          {
            Name: 'capabilities',
            Description: 'list of additional capabilities required',
            Value: ['CAP_SYS_ADMIN']
          }
        ]
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
        installed = true;
        done();
      }

      plugin.enable({
        'timeout': 5
      }, handler);
    });

    it("should disable a plugin", function(done) {
      this.timeout(15000);
      var plugin = docker.getPlugin('sshfs');

      function handler(err, data) {
        if (installed === true) {
          expect(err).to.be.null;
        } else {
          expect(err).to.be.ok;
        }
        done();
      }

      plugin.disable(handler);
    });

    it("should remove a plugin", function(done) {
      this.timeout(15000);
      var plugin = docker.getPlugin('sshfs');

      function handler(err) {
        expect(err).to.be.null;
        done();
      }

      plugin.remove(handler);
    });

  });
});
