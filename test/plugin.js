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

});
