module.exports = class NullsafeProxy {
  constructor(target) {
    this.target = target;
    this.isNull = (target == null);
  }

  get value() {
    return this.target;
  }

  apply(methodName, args) {
    if (!this.isNull && this.target[methodName]) {
      return new NullsafeProxy(this.target[methodName].apply(this.target[methodName], args));
    } else {
      return new NullsafeProxy(null);
    }
  }

  call(methodName) {
    return this.apply(methodName, this._extractArgs(arguments));
  }

  get(attribute) {
    if (!this.isNull && this.target[attribute]) {
      return new NullsafeProxy(this.target[attribute]);
    } else {
      return new NullsafeProxy(null);
    }
  }

  _extractArgs(args) {
    return (args.length === 1 ? [args[0]] : Array.apply(null, args)).slice(1);
  }
}
