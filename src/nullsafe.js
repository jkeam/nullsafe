const NullsafeProxy = require('./models/nullsafeProxy');

module.exports = (target, path) => {
  return new NullsafeProxy(target, path);
};
