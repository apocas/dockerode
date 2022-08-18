var expect = require('chai').expect;
var util = require('../lib/util');
var path = require('path');
var zlib = require('zlib');
var tar = require('tar-fs');
var fs = require('fs');
var os = require('os');

describe('util', function () {

  describe('#parseRepositoryTag', function () {
    function validate(input, expected) {
      it('should parse "' + input + '"', function () {
        expect(util.parseRepositoryTag(input)).to.eql(expected);
      });
    }

    // test params taken from:
    // https://github.com/dotcloud/docker/blob/c23b15b9d84ed7d9421d8946c4e0a309e12cecf3/utils/utils_test.go#L333
    validate('root', {
      repository: 'root'
    });

    validate('root:tag', {
      repository: 'root',
      tag: 'tag'
    });

    validate('root@sha256:1234abc', {
      repository: 'root',
      tag: 'sha256:1234abc'
    });

    validate('user/repo', {
      repository: 'user/repo'
    });

    validate('user/repo:tag', {
      repository: 'user/repo',
      tag: 'tag'
    });

    validate('urlx:5000/repo', {
      repository: 'urlx:5000/repo'
    });

    validate('url:5000/repo:tag', {
      repository: 'url:5000/repo',
      tag: 'tag'
    });
  });

  // https://github.com/HenrikJoreteg/extend-object/blob/v0.1.0/test.js
  describe('.extend', function () {
    it('accepts multiple object arguments', function () {
      var start = {};
      expect(util.extend(start, { name: 'test' }, { hello: 'test' })).to.deep.equal({ name: 'test', hello: 'test' });
      expect(start).to.eql(util.extend(start, {}));
    });
  });

  describe('.prepareBuildContext', function () {

    it("should pass the options through when there is no context", function () {
      const dummy = {};
      util.prepareBuildContext(dummy, function (ctx) {
        expect(ctx).to.be.equal(dummy);
      })
    });

    it("bundle the context and source as a single tar.gz stream", function (done) {
      this.timeout(60000);

      function handler(stream) {
        expect(stream).to.be.ok;

        const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'dockerode-'));
        const z = zlib.createGunzip();

        stream
          .pipe(z)
          .pipe(tar.extract(tmp), { end: true })
          .on('finish', function () {
            const files = fs.readdirSync(tmp);

            expect(files.length).to.be.equal(2);
            expect(files).to.have.members(['Dockerfile', 'MC-hammer.txt']);

            fs.rm(tmp, { recursive: true });
            done();
          });
      }

      util.prepareBuildContext({
        context: path.join(__dirname, 'fixtures', 'dockerignore'),
        src: ['Dockerfile', 'MC-hammer.txt', 'ignore-dir', 'foo.txt']
      }, handler);
    });
  });
});
