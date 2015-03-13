// https://github.com/HenrikJoreteg/extend-object/blob/v0.1.0/extend-object.js

var arr = [];
var each = arr.forEach;
var slice = arr.slice;

module.exports.extend = function(obj) {
  each.call(slice.call(arguments, 1), function(source) {
    if (source) {
      for (var prop in source) {
          obj[prop] = source[prop];
      }
    }
  });
  return obj;
};

/**
 * Parse the given repo tag name (as a string) and break it out into repo/tag pair.
 * // if given the input http://localhost:8080/woot:latest
 * {
 *   repository: 'http://localhost:8080/woot',
 *   tag: 'latest'
 * }
 * @param {String} input Input e.g: 'repo/foo', 'ubuntu', 'ubuntu:latest'
 * @return {Object} input parsed into the repo and tag.
 */
function parseRepositoryTag(input) {
  var colonPos = input.lastIndexOf(':');

  // no colon
  if (colonPos < 0) {
    return { repository: input };
  }

  // last colon is either the tag (or part of a port designation)
  var tag = input.slice(colonPos + 1);

  // if it contains a / its not a tag and is part of the url
  if (tag.indexOf('/') === -1) {
    return {
      repository: input.slice(0, colonPos),
      tag: tag
    };
  }

  return { repository: input };
}


module.exports.parseRepositoryTag = parseRepositoryTag;
