var grpc = require("@grpc/grpc-js"),
  protoLoader = require("@grpc/proto-loader"),
  path = require("path"),
  crypto = require("crypto");

function withSession(docker, auth, handler) {
  const sessionId = crypto.randomUUID();

  const opts = {
    method: "POST",
    path: "/session",
    hijack: true,
    headers: {
      Upgrade: "h2c",
      "X-Docker-Expose-Session-Uuid": sessionId,
      "X-Docker-Expose-Session-Name": "testcontainers",
    },
    statusCodes: {
      200: true,
      500: "server error",
    },
  };

  docker.modem.dial(opts, function (err, socket) {
    if (err) {
      return handler(err, null, () => undefined);
    }

    const server = new grpc.Server();
    const creds = grpc.ServerCredentials.createInsecure();
    const injector = server.createConnectionInjector(creds);
    injector.injectConnection(socket);

    const pkg = protoLoader.loadSync(
      path.resolve(__dirname, "proto", "auth.proto")
    );
    const service = grpc.loadPackageDefinition(pkg);

    server.addService(service.moby.filesync.v1.Auth.service, {
      Credentials({ request }, callback) {
        // We probably want to have the possibility to pass credentials per
        // hots. The correct one could be returned based on `request.Host`
        if (auth) {
          callback(null, {
            Username: auth.username,
            Secret: auth.password,
          });
        } else {
          callback(null, {});
        }
      },
    });

    // BuildKit health-checks the session's gRPC connection (grpc.health.v1.Health/Check)
    // and tears the session down after a couple of consecutive failed checks
    // (moby/buildkit session/grpc.go). Without a Health service the check returns
    // UNIMPLEMENTED, so BuildKit drops the session before the build's first vertex and
    // the build stalls (typically at "load metadata for <base image>"). Serve SERVING so
    // the session stays up for the lifetime of the build.
    const healthPkg = protoLoader.loadSync(
      path.resolve(__dirname, "proto", "health.proto")
    );
    const healthService = grpc.loadPackageDefinition(healthPkg);

    server.addService(healthService.grpc.health.v1.Health.service, {
      Check(call, callback) {
        callback(null, { status: "SERVING" });
      },
      Watch(call) {
        call.write({ status: "SERVING" });
      },
    });

    function done() {
      server.forceShutdown();
      socket.end();
    }

    handler(null, sessionId, done);
  });
}

module.exports = withSession;
