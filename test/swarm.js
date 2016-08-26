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

  describe("#Services", function() {
    var service;

    it("should create service", function(done) {
      this.timeout(5000);

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

    it("should inspect a service without callback", function(done) {
      expect(service.inspect()).to.be.a('string');
      done();
    });

    it("should inspect service", function(done) {
      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.ok;
        done();
      }
      service.inspect(handler);
    });

    it("should update service", function(done) {
      function handler(err, data) {
        expect(err).to.be.null;
        expect(data).to.be.ok;
        done();
      }
      var opts = {
        "Name": "redis",
        "version": 2,
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

    it("should delete service", function(done) {
      this.timeout(5000);

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
        it("should inspect a task without callback", function(done) {
          expect(task.inspect()).to.be.a('string');
          done();
        });

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

      it("should inspect a node without callback", function(done) {
        expect(node.inspect()).to.be.a('string');
        done();
      });

      it("should inspect node", function(done) {
        function handler(err, data) {
          expect(err).to.be.null;
          expect(data).to.be.ok;
          done();
        }
        node.inspect(handler);
      });
    });
  });

  describe("#leaveSwarm", function() {
    it("should leave swarm", function(done) {
      this.timeout(5000);

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
