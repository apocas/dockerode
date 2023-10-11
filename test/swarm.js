/*jshint -W030 */

var expect = require('chai').expect;
var docker = require('./spec_helper').docker;

describe("#swarm", function() {

  describe("#initSwarm", function() {
    it("should init swarm", function(done) {
      this.timeout(5000);

      function handler(err, data) {
        expect(err).to.be.null;
        done();
      }

      var opts = {
        "ListenAddr": "0.0.0.0:4500",
        "ForceNewCluster": false,
        "Spec": {
          "AcceptancePolicy": {
            "Policies": [{
              "Role": "MANAGER",
              "Autoaccept": false
            }, {
              "Role": "WORKER",
              "Autoaccept": true
            }]
          },
          "Orchestration": {},
          "Raft": {},
          "Dispatcher": {},
          "CAConfig": {}
        }
      };

      docker.swarmInit(opts, handler);
    });

    it("should inspect swarm", function(done) {
      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.a('object');
        done();
      }

      docker.swarmInspect(handler);
    });
  });

  describe("#Secrets", function() {
    var secret;
    var d;

    it("should list secrets", function(done) {
      this.timeout(5000);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.a('array');
        done();
      }

      docker.listSecrets({}, handler);
    });

    it("should create secret", function(done) {
      this.timeout(5000);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.a('object');
        secret = data;
        done();
      }

      var opts = {
        "Name": "app-key.crt",
        "Labels": {
          "foo": "bar"
        },
        "Data": "VEhJUyBJUyBOT1QgQSBSRUFMIENFUlRJRklDQVRFCg=="
      };

      docker.createSecret(opts, handler);
    });

    it("should inspect secret", function(done) {
      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.ok;
        d = data;
        done();
      }
      secret.inspect(handler);
    });


    it("should update secret", function(done) {
      this.timeout(15000);

      function handler(err) {
        expect(err).to.be.null;
        done();
      }
      var opts = {
        "Name": "app-key.crt",
        "version": parseInt(d.Version.Index),
        "Labels": {
          "foo": "bar",
          "foo2": "bar2"
        },
        "Data": "VEhJUyBJUyBOT1QgQSBSRUFMIENFUlRJRklDQVRFCg=="
      };
      secret.update(opts, handler);
    });

    it("should delete secret", function(done) {
      this.timeout(5000);

      function handler(err, data) {
        expect(err).to.be.null;
        done();
      }

      secret.remove(handler);
    });
  });


  describe("#Configs", function() {
    var config;
    var d;

    it("should create config", function(done) {
      this.timeout(5000);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.a('object');
        config = data;
        done();
      }

      var opts = {
        "Name": "app-key.conf",
        "Labels": {
          "foo": "bar"
        },
        "Data": "VEhJUyBJUyBOT1QgQSBSRUFMIENFUlRJRklDQVRFCg=="
      };

      docker.createConfig(opts, handler);
    });

    it("should list configs", function(done) {
      this.timeout(5000);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.a('array');
        done();
      }

      docker.listConfigs({}, handler);
    });

    it("should inspect config", function(done) {
      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.ok;
        d = data;
        done();
      }
      config.inspect(handler);
    });


    it("should update config", function(done) {
      this.timeout(15000);

      function handler(err) {
        expect(err).to.be.null;
        done();
      }
      var opts = {
        "Name": "app-key.conf",
        "version": parseInt(d.Version.Index),
        "Labels": {
          "foo": "bar",
          "foo2": "bar2"
        },
        "Data": "VEhJUyBJUyBOT1QgQSBSRUFMIENFUlRJRklDQVRFCg=="
      };
      config.update(opts, handler);
    });

    it("should delete config", function(done) {
      this.timeout(5000);

      function handler(err, data) {
        expect(err).to.be.null;
        done();
      }

      config.remove(handler);
    });
  });


  describe("#Services", function() {
    var service;
    var d;

    it("should create service", function(done) {
      this.timeout(60000);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.a('object');
        service = data;
        done();
      }

      var opts = {
        "Name": "redis",
        "TaskTemplate": {
          "ContainerSpec": {
            "Image": "redis"
          },
          "Resources": {
            "Limits": {},
            "Reservations": {}
          },
          "RestartPolicy": {},
          "Placement": {}
        },
        "Mode": {
          "Replicated": {
            "Replicas": 1
          }
        },
        "UpdateConfig": {
          "Parallelism": 1
        },
        "EndpointSpec": {
          "ExposedPorts": [{
            "Protocol": "tcp",
            "Port": 6379
          }]
        }
      };

      docker.createService(opts, handler);
    });

    it("should list services", function(done) {
      this.timeout(5000);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.a('array');
        done();
      }

      docker.listServices(handler);
    });

    it("should list services using promises", function(done) {
      this.timeout(5000);

      docker.listServices({}).then(function(services) {
        expect(services).to.be.a('array');
        done();
      }).catch(function(err) {
        expect(err).to.be.null;
        done();
      });
    });

    it("should inspect service", function(done) {
      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.ok;
        d = data;
        done();
      }
      service.inspect(handler);
    });

    it("should update service", function(done) {
      this.timeout(30000);

      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.ok;
        done();
      }
      var opts = {
        "Name": "redis",
        "version": parseInt(d.Version.Index),
        "TaskTemplate": {
          "ContainerSpec": {
            "Image": "redis"
          },
          "Resources": {
            "Limits": {},
            "Reservations": {}
          },
          "RestartPolicy": {},
          "Placement": {}
        },
        "Mode": {
          "Replicated": {
            "Replicas": 1
          }
        },
        "UpdateConfig": {
          "Parallelism": 1
        },
        "EndpointSpec": {
          "ExposedPorts": [{
            "Protocol": "tcp",
            "Port": 6379
          }]
        }
      };
      service.update(opts, handler);
    });



    it("should get the logs for a service as a stream", function(done) {
      this.timeout(30000);

      var logs_opts = {
        follow: true,
        stdout: true,
        stderr: true,
        timestamps: true
      };

      function handler(err, stream) {
        expect(err).to.be.null;
        expect(stream.pipe).to.be.ok;
        done();
      }

      service.logs(logs_opts, handler);
    });

      it("should delete service", function(done) {
        this.timeout(30000);

        function handler(err, data) {
          expect(err).to.be.null;
          done();
        }

        service.remove(handler);
      });

  });

  describe("#tasks", function() {
    var task;
    describe("#listTasks", function() {
      it("should list tasks", function(done) {
        this.timeout(5000);

        function handler(err, data) {
          expect(err).to.be.null;
          expect(data).to.be.a('array');
          if (data.length > 0) {
            task = docker.getTask(data[0].ID || data[0].Id);
          }
          done();
        }

        docker.listTasks(handler);
      });

      if (task) {
        it("should inspect task", function(done) {
          function handler(err, data) {
            expect(err).to.be.null;
            expect(data).to.be.ok;
            done();
          }
          task.inspect(handler);
        });
      }
    });
  });

  describe("#nodes", function() {
    var node;
    describe("#listNodes", function() {
      it("should list nodes", function(done) {
        this.timeout(5000);

        function handler(err, data) {
          expect(err).to.be.null;
          expect(data).to.be.a('array');
          node = docker.getNode(data[0].ID || data[0].Id);
          done();
        }

        docker.listNodes(handler);
      });

      it("should inspect node", function(done) {
        function handler(err, data) {
          expect(err).to.be.null;
          expect(data).to.be.ok;
          done();
        }
        node.inspect(handler);
      });

      it("should remove node", function(done) {
        function handler(err, data) {
          // error is [Error: (HTTP code 500) server error - rpc error: code = 9 desc = node xxxxxxxxxx is a cluster manager and is a member of the raft cluster. It must be demoted to worker before removal ]
          expect(err).to.not.be.null;
          expect(data).to.be.null;
          done();
        }
        node.remove(handler);
      });
    });
  });

  describe("#leaveSwarm", function() {
    it("should leave swarm", function(done) {
      this.timeout(10000);

      function handler(err, data) {
        expect(err).to.be.null;
        done();
      }

      docker.swarmLeave({
          'force': true
        },
        handler
      );
    });
  });
});
