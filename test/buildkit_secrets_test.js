var assert = require('assert');
var crypto = require('crypto');
var PassThrough = require('stream').PassThrough;
var Docker = require('../lib/docker');
var docker = require('./spec_helper').docker;

describe('BuildKit build secrets', function () {
  this.timeout(60000);

  ['callback', 'promise'].forEach(function (api) {
    it('should mount secrets through the ' + api + ' API without leaking them into the URL or logs', async function () {
      var secret = Buffer.from(crypto.randomBytes(32).toString('hex'));
      var secrets = Object.freeze({ buildsecret: secret });
      var image = docker.getImage('dockerode-secrets-test-' + crypto.randomUUID());
      var options = Object.freeze({
        version: '2',
        t: image.name,
        dockerfile: 'buildkit-secrets.Dockerfile',
        nocache: true,
        buildargs: { SECRET_SHA256: crypto.createHash('sha256').update(secret).digest('hex') },
        secrets: secrets
      });
      var context = { context: __dirname, src: ['buildkit-secrets.Dockerfile'] };
      var buildRequest;
      var dial = docker.modem.dial;
      docker.modem.dial = function (request, callback) {
        if (request.path === '/build?') buildRequest = request;
        return dial.call(this, request, callback);
      };

      try {
        var stream = api === 'promise' ? await docker.buildImage(context, options) :
          await new Promise(function (resolve, reject) {
            docker.buildImage(context, options, function (err, result) {
              if (err) return reject(err);
              resolve(result);
            });
          });
        var output = await new Promise(function (resolve, reject) {
          docker.followProgress(stream, function (err, events) {
            if (err) return reject(err);
            resolve(events);
          });
        });

        assert.ok((await image.inspect()).Id);
        assert.strictEqual(Object.prototype.hasOwnProperty.call(buildRequest.options, 'secrets'), false);
        assert.strictEqual(options.secrets, secrets);
        assert.strictEqual(options.session, undefined);
        assert.strictEqual(JSON.stringify(output).includes(secret.toString()), false);
      } finally {
        docker.modem.dial = dial;
        try {
          await image.remove();
        } catch (err) {
          if (err.statusCode !== 404) throw err;
        }
      }
    });
  });

  it('should exclude secrets from legacy build requests too', async function () {
    var client = new Docker();
    var options = Object.freeze({ version: '1', secrets: { unused: Buffer.from('test secret') } });
    var request;
    client.modem.dial = function (value, callback) {
      request = value;
      callback(null, new PassThrough());
    };
    var stream = await client.buildImage(Buffer.alloc(0), options);
    stream.destroy();
    assert.strictEqual(Object.prototype.hasOwnProperty.call(request.options, 'secrets'), false);
    assert.ok(options.secrets.unused);
  });
});
