/*jshint -W030 */

var expect = require('chai').expect;
var docker = require('./spec_helper').docker;

var testImage = 'ubuntu:14.04';

describe("#image", function() {

  describe("#inspect", function() {
    it("should inspect a image without callback", function(done) {
      var image = docker.getImage(testImage);
      expect(image.inspect()).to.be.a('string');
      done();
    });

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


  describe("#get", function() {
    it("should get an image", function(done) {
      this.timeout(120000);

      var image = docker.getImage(testImage);

      function handler(err, stream) {
        expect(err).to.be.null;
        expect(stream).to.be.ok;

        done();
      }

      image.get(handler);
    });
  });

});
