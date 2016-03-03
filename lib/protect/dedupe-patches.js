module.exports = dedupe;

var debug = require('debug')('snyk:patch');
var patchesForPackage = require('./patches-for-package');

function dedupe(source) {
  // console.log(source);

  var names = source.reduce(function (acc, vuln) {
    if (Array.isArray(vuln.patches)) {
      // strip down to the only paches that can be applied
      vuln.patches = patchesForPackage(vuln);
    }

    var key = vuln.name + vuln.version + vuln.from.join('>');

    var other = acc[key];
    if (other) {
      debug('dupe found on %s & %s', vuln.id, other.id, key);
      if (vuln.patches.modificationTime > other.patches.modificationTime) {
        debug('stripping %s', other.id);
        acc[key] = vuln;
      }
    } else {
      acc[key] = vuln;
    }

    return acc;
  }, {});

  // turn back into an array
  var packages = Object.keys(names).map(function (key) {
    return names[key];
  });

  return packages;
}