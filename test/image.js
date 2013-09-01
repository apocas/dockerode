var Docker = require('../lib/docker');
var expect = require('chai').expect;

var testImage = 'ubuntu';

var docker = new Docker({socketPath: '/var/run/docker.sock'});

describe("#image", function() {

  describe("#inspect", function() {
    it("should inspect a image", function(done) {

      var image = docker.getImage(testImage);

      function handler(err, data) {
        expect(err).to.be.null;
        //console.log(data);
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
        //console.log(data);
        done();
      }

      image.history(handler);
    });
  });
});