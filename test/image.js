/*jshint -W030 */

var expect = require('chai').expect;
var docker = require('./spec_helper').docker;

var testImage = 'ubuntu:latest';

describe("#image", function() {

  describe("#inspect", function() {
    it("should inspect an image", function(done) {
      var image = docker.getImage(testImage);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.ok;
        done();
      }

      image.inspect(handler);
    });

    it("should inspect an image with manifest", function (done) {
      var image = docker.getImage(testImage);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.ok;
        done();
      }

      image.inspect({manifest: 1}, handler);
    });
  });

  describe("#distribution", function() {
    it("should distribution an image", function(done) {
      this.timeout(30000);
      var image = docker.getImage(testImage);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.ok;
        done();
      }

      image.distribution(handler);
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
