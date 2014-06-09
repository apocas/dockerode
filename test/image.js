var expect = require('chai').expect;
var docker = require('./spec_helper').docker;

var testImage = 'ubuntu';

describe("#image", function() {

  describe("#inspect", function() {
    it("should inspect a image", function(done) {

      var image = docker.getImage(testImage);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.ok;
        done();
      }

      image.inspect(handler);
    });
  });

  describe("#history", function() {
    it("should get image history", function(done) {

      var image = docker.getImage(testImage);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.a('array');
        done();
      }

      image.history(handler);
    });
  });

});
