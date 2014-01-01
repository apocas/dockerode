var expect = require('chai').expect;
var util = require('../lib/util');

describe('util', function() {

  describe('#parseRepositoryTag', function() {
    function validate(input, expected) {
      it('should parse "' + input + '"', function() {
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
});
