var expect = require("chai").expect;
var Docker = require("../lib/docker");
var stream = require("stream");
var PassThrough = stream.PassThrough;

describe("#followProgress", function() {
  var docker = new Docker();

  describe("stream handling", function() {
    it("should handle incomplete lines across chunks", function(done) {
      var mockStream = new PassThrough();
      var results = [];
      
      docker.followProgress(mockStream,
        function onFinished(err, output) {
          expect(err).to.be.null;
          expect(output.length).to.equal(2);
          expect(output[0].stream).to.include("Step 1");
          expect(output[1].stream).to.include("Step 2");
          done();
        },
        function onProgress(event) {
          results.push(event);
        }
      );
      
      // Simulate chunks that split lines awkwardly
      mockStream.write('{"stream":"Step 1/3 : FROM');
      mockStream.write(' alpine\\n"}\n{"stream":"');
      mockStream.write('Step 2/3 : RUN echo test\\n"}\n');
      mockStream.end();
    });
    
    it("should handle chunk ending mid-line", function(done) {
      var mockStream = new PassThrough();
      
      docker.followProgress(mockStream,
        function onFinished(err, output) {
          expect(err).to.be.null;
          expect(output.length).to.equal(2);
          expect(output[0].stream).to.include("Complete line");
          expect(output[1].stream).to.include("Incomplete line");
          done();
        }
      );
      
      // First chunk ends in middle of a line (no newline)
      mockStream.write('{"stream":"Complete line\\n"}\n{"stream":"Incompl');
      // Second chunk completes it
      mockStream.write('ete line\\n"}\n');
      mockStream.end();
    });
    
    it("should handle BuildKit messages split across chunks", function(done) {
      var mockStream = new PassThrough();
      
      docker.followProgress(mockStream,
        function onFinished(err, output) {
          expect(err).to.be.null;
          expect(output).to.be.an("array");
          done();
        }
      );
      
      // Split a BuildKit trace message across chunks
      var buildkitMsg = '{"id":"moby.buildkit.trace","aux":""}\n';
      var mid = Math.floor(buildkitMsg.length / 2);
      
      mockStream.write(buildkitMsg.substring(0, mid));
      mockStream.write(buildkitMsg.substring(mid));
      mockStream.end();
    });
    
    it("should decode real BuildKit base64 protobuf messages", function(done) {
      var mockStream = new PassThrough();
      var receivedEvents = [];
      
      docker.followProgress(mockStream,
        function onFinished(err, output) {
          expect(err).to.be.null;
          expect(output.length).to.be.greaterThan(0);
          // Should have decoded the base64 protobuf successfully
          var hasDecodedLog = receivedEvents.some(function(e) {
            return e.stream && e.stream.includes("internal");
          });
          expect(hasDecodedLog).to.be.true;
          done();
        },
        function onProgress(event) {
          receivedEvents.push(event);
        }
      );
      
      // Real BuildKit message with actual base64 protobuf data
      // Decodes to: "[internal] load remote build context"
      var buildkitMsg = '{"id":"moby.buildkit.trace","aux":"Cm8KR3NoYTI1NjpkMDZmYWJlMGZmMTMzZTVhN2Q4ODE2Yjg3ZTdjYmE2ZjUwZWI3ZDM0NWY3N2EyY2Y5M2Y4NmI1OWFiZWFiNWNhGiRbaW50ZXJuYWxdIGxvYWQgcmVtb3RlIGJ1aWxkIGNvbnRleHQKfApHc2hhMjU2OmQwNmZhYmUwZmYxMzNlNWE3ZDg4MTZiODdlN2NiYTZmNTBlYjdkMzQ1Zjc3YTJjZjkzZjg2YjU5YWJlYWI1Y2EaJFtpbnRlcm5hbF0gbG9hZCByZW1vdGUgYnVpbGQgY29udGV4dCoLCL6hz8sGEJuPn2E="}\n';
      
      mockStream.write(buildkitMsg);
      mockStream.end();
    });
    
    it("should ignore empty lines", function(done) {
      var mockStream = new PassThrough();
      
      docker.followProgress(mockStream,
        function onFinished(err, output) {
          expect(err).to.be.null;
          // Should only have 2 events, empty lines ignored
          expect(output.length).to.equal(2);
          done();
        }
      );
      
      mockStream.write('{"stream":"Line 1\\n"}\n');
      mockStream.write('\n'); // Empty line
      mockStream.write('\n'); // Another empty line
      mockStream.write('{"stream":"Line 2\\n"}\n');
      mockStream.end();
    });
    
    it("should process final buffered data on stream end", function(done) {
      var mockStream = new PassThrough();
      
      docker.followProgress(mockStream,
        function onFinished(err, output) {
          expect(err).to.be.null;
          // Should process the line that didn't end with \n
          expect(output.length).to.equal(1);
          expect(output[0].stream).to.include("Final");
          done();
        }
      );
      
      // Send a line without trailing newline
      mockStream.write('{"stream":"Final line\\n"}');
      mockStream.end(); // Should trigger processing of buffered data
    });

    it("should work without onProgress callback", function(done) {
      var mockStream = new PassThrough();
      
      docker.followProgress(mockStream, function(err, output) {
        expect(err).to.be.null;
        expect(output).to.be.an("array");
        expect(output.length).to.equal(2);
        done();
      });
      
      mockStream.write('{"stream":"Line 1\\n"}\n');
      mockStream.write('{"stream":"Line 2\\n"}\n');
      mockStream.end();
    });
  });

  describe("integration", function() {
    it("should follow BuildKit build progress", function(done) {
      this.timeout(60000);
      var randomId = "buildkit-test-" + Date.now();

      docker.buildImage(
        {
          context: __dirname,
          src: ["buildkit.Dockerfile"]
        },
        {
          dockerfile: "buildkit.Dockerfile",
          version: "2",
          t: randomId,
        },
        function(err, stream) {
          expect(err).to.be.null;
          expect(stream).to.be.ok;

          var progressEvents = [];

          docker.followProgress(stream,
            function onFinished(err, output) {
              expect(err).to.be.null;
              expect(output).to.be.an("array");
              expect(output.length).to.be.greaterThan(0);
              
              console.log("\n  Total events:", output.length);
              console.log("  Progress callbacks:", progressEvents.length);
              
              // Clean up
              docker.getImage(randomId).remove(function() {
                done();
              });
            },
            function onProgress(event) {
              progressEvents.push(event);
              if (event.stream) {
                console.log("    Progress:", event.stream.trim().substring(0, 60));
              }
            }
          );
        }
      );
    });

    it("should work with regular builds too", function(done) {
      this.timeout(60000);
      var randomId = "regular-test-" + Date.now();

      docker.buildImage(
        {
          context: __dirname,
          src: ["buildkit.Dockerfile"]
        },
        {
          dockerfile: "buildkit.Dockerfile",
          // No version: "2" - regular build
          t: randomId,
        },
        function(err, stream) {
          expect(err).to.be.null;

          docker.followProgress(stream,
            function onFinished(err, output) {
              expect(err).to.be.null;
              expect(output).to.be.an("array");
              
              console.log("\n  Regular build events:", output.length);
              
              docker.getImage(randomId).remove(function() {
                done();
              });
            },
            function onProgress(event) {
              // Regular builds have different event format
              expect(event).to.be.an("object");
            }
          );
        }
      );
    });
  });
});
