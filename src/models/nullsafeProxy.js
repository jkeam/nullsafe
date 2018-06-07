module.exports = class NullsafeProxy {
  /**
   * Constructor to store the target (real) object.
   * @param  {Object} target object that we are wrapping
   * @param  {Array} path optional path, used to immediately traverse the target and wrap that value
   * @return {NullSafeProxy} proxy object wrapping the passed in target
   */
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
  /**
   * Gets the value/target being wrapped
   * @return {Object} the target that was wrapped
   */
  get value() {
    return this.target;
  }

  /**
   * Indicates if the target is null.
   * @return {Boolean} indicates if the target is null
   */
  isNull() {
    return this.isNullValue;
  }

  /**
   * Way to call a function on the target object.
   * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply
   * @param  {String} methodName name of method to call
   * @param  {Array} args arguments to pass into the method invocation
   * @return {Object} result of the method on the target
   */
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

  /**
   * Way to call a function on the target object.
   * See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call
   * @param  {String} methodName name of method to call, arguments are passed after this argument separated by commas
   * @return {Object} result of the method on the target
   */
  call(methodName) {
    return this.apply(methodName, this._extractArgs(arguments));
  }

  /**
   * Gets the value; a wrapped object.
   * @param  {String} attribute the name of the attribute you want to get
   * @param  {Integer} position optional; if the attribute is an array, this is the element position
   * @return {Object} wrapped proxy containing the real value as its target
   */
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
        cur = null;
        i = path.length;
      }
    }
    return cur;
  }
}
