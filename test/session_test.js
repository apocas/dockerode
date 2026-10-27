var assert = require('assert');
var net = require('net');
var path = require('path');
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
var withSession = require('../lib/session');

var healthPackage = grpc.loadPackageDefinition(protoLoader.loadSync(
  path.resolve(__dirname, '../lib/proto/health.proto'), { enums: String }
));
var Health = healthPackage.grpc.health.v1.Health;
var authPackage = grpc.loadPackageDefinition(protoLoader.loadSync(
  path.resolve(__dirname, '../lib/proto/auth.proto')
));

async function withTestSession(run) {
  var listener = net.createServer();
  var sockets = new Set();
  var client;
  var done;
  var sessionId;

  try {
    await new Promise(function (resolve, reject) {
      listener.once('error', reject);
      listener.listen(0, '127.0.0.1', resolve);
    });

    // Let a real gRPC client connect to the socket injected by withSession,
    // without depending on a Docker daemon or a slow image build.
    withSession({ modem: { dial: function (options, callback) {
      assert.strictEqual(options.path, '/session');
      assert.strictEqual(options.hijack, true);
      assert.strictEqual(options.headers.Upgrade, 'h2c');
      listener.once('connection', function (socket) {
        sockets.add(socket);
        callback(null, socket);
      });
    } } }, { username: 'test-user', password: 'test-password' }, function (err, id, close) {
      assert.ifError(err);
      sessionId = id;
      done = close;
    });

    client = new Health('127.0.0.1:' + listener.address().port, grpc.credentials.createInsecure());
    await run(client);
    assert.match(sessionId, /^[0-9a-f-]{36}$/);
  } finally {
    if (done) done();
    if (client) client.close();
    sockets.forEach(function (socket) { socket.destroy(); });
    await new Promise(function (resolve) { listener.close(resolve); });
  }
}

function check(client) {
  return new Promise(function (resolve, reject) {
    client.check({}, { deadline: Date.now() + 2000 }, function (err, response) {
      if (err) return reject(err);
      resolve(response);
    });
  });
}

describe('BuildKit session health', function () {
  this.timeout(5000);

  it('should report SERVING for repeated Health/Check requests', async function () {
    await withTestSession(async function (client) {
      for (var i = 0; i < 3; i++) {
        assert.strictEqual((await check(client)).status, 'SERVING');
      }
    });
  });

  it('should initially report SERVING for Health/Watch and tolerate cancellation', async function () {
    await withTestSession(async function (client) {
      var watch = client.watch({}, { deadline: Date.now() + 2000 });
      var cancelled = new Promise(function (resolve) { watch.once('error', resolve); });
      try {
        var response = await new Promise(function (resolve, reject) {
          watch.once('data', resolve);
          watch.once('error', reject);
        });
        assert.strictEqual(response.status, 'SERVING');
      } finally {
        watch.cancel();
      }
      assert.strictEqual((await cancelled).code, grpc.status.CANCELLED);
      assert.strictEqual((await check(client)).status, 'SERVING');
    });
  });

  it('should continue serving registry credentials alongside health checks', async function () {
    await withTestSession(async function (client) {
      await check(client);
      var Auth = authPackage.moby.filesync.v1.Auth;
      var auth = new Auth('unused', grpc.credentials.createInsecure(), {
        channelOverride: client.getChannel()
      });
      var response = await new Promise(function (resolve, reject) {
        auth.credentials({ Host: 'registry.example' }, { deadline: Date.now() + 2000 }, function (err, result) {
          if (err) return reject(err);
          resolve(result);
        });
      });
      assert.deepStrictEqual(response, { Username: 'test-user', Secret: 'test-password' });
    });
  });
});
