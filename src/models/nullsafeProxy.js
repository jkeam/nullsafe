module.exports = class NullsafeProxy {
  // Constructor to store the target (real) object.
  // target (Object): the real object
  // path (Array): optional path, used to immediate traverse the path
  constructor(target, path) {
    if (path) {
      this.target = this._traversePath(target, path);
    } else {
      this.target = target;
    }
    // Rely on loose equality with null in order to capture both null and undefined values
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Equality_comparisons_and_sameness
    this.isNullValue = (this.target == null);
  }

  // Extracts the possibly null value.
  get value() {
    return this.target;
  }

  // indicates if the value is null
  isNull() {
    return this.isNullValue;
  }

  // Way to call a function on the target object.
  // methodName (string): the method name
  // args (array): array holding the arguments to pass into the method invocation
  // See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply
  apply(methodName, args) {
    if (methodName == null) {
      if (!this.isNullValue) {
        return new NullsafeProxy(this.target.apply(this.target, args));
      } else {
        return new NullsafeProxy(null);
      }
    }

    if (!this.isNullValue && this.target[methodName]) {
      return new NullsafeProxy(this.target[methodName].apply(this.target[methodName], args));
    } else {
      return new NullsafeProxy(null);
    }
  }

  // Way to call a function on the target object.
  // methodName (string): the method name
  // arguments are passed after the methodName argument, separated by commas
  // See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call
  call(methodName) {
    return this.apply(methodName, this._extractArgs(arguments));
  }

  // Gets the value.
  // attribute (string): the name of the attribute you want to get
  // position (int): if the attribute you want to get is an array, you can get the element in this position
  get(attribute, position=null) {
    if (!this.isNullValue && this.target[attribute]) {
      if (position != null) {
        return new NullsafeProxy(this.target[attribute][position]);
      } else {
        return new NullsafeProxy(this.target[attribute]);
      }
    } else {
      return new NullsafeProxy(null);
    }
  }

  // Helper method to extract arguments passed into the call method
  _extractArgs(args) {
    return (args.length === 1 ? [args[0]] : Array.apply(null, args)).slice(1);
  }

  // Helper function to walk the path for this object
  _traversePath(obj, path) {
    let cur = obj;
    for (let i = 0; i < path.length; i++) {
      cur = cur[path[i]];
      if (!cur) {
        i = path.length;
      }
    }
    return cur;
  }
}
