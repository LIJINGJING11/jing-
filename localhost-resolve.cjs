const dns = require('node:dns');
const originalLookup = dns.lookup;
dns.lookup = function lookup(hostname, options, callback) {
  if (hostname === 'localhost') hostname = '127.0.0.1';
  return originalLookup.call(this, hostname, options, callback);
};
