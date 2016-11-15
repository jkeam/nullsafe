const NullsafeProxy = require('./models/nullsafeProxy');

module.exports = (target) => {
  return new NullsafeProxy(target);
};
