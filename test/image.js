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

  describe("#insert", function() {
    it("should insert file", function(done) {
      var image = docker.getImage('ubuntu');

      this.timeout(5000);

      function handler(err, stream) {
        expect(err).to.be.null;

        stream.pipe(process.stdout, {end: true});
        
        stream.on('end', function() {
          done();
        });
      }

      image.insert({path: '/usr', url: 'http://gravatar.com/avatar/c278114f8923b4b5363c363e6b22dfd2'}, handler);
    });
  });
});