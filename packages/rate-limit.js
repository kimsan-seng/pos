(function () {

/* Imports */
var Meteor = Package.meteor.Meteor;
var global = Package.meteor.global;
var meteorEnv = Package.meteor.meteorEnv;
var Random = Package.random.Random;
var ECMAScript = Package.ecmascript.ECMAScript;
var meteorInstall = Package.modules.meteorInstall;
var Promise = Package.promise.Promise;

/* Package-scope variables */
var RateLimiter;

var require = meteorInstall({"node_modules":{"meteor":{"rate-limit":{"rate-limit.js":function module(require,exports,module){

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                          //
// packages/rate-limit/rate-limit.js                                                                        //
//                                                                                                          //
//////////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                            //
module.export({
  RateLimiter: () => RateLimiter
});
let Meteor;
module.link("meteor/meteor", {
  Meteor(v) {
    Meteor = v;
  }
}, 0);
let Random;
module.link("meteor/random", {
  Random(v) {
    Random = v;
  }
}, 1);
// Default time interval (in milliseconds) to reset rate limit counters
const DEFAULT_INTERVAL_TIME_IN_MILLISECONDS = 1000;
// Default number of events allowed per time interval
const DEFAULT_REQUESTS_PER_INTERVAL = 10;
const hasOwn = Object.prototype.hasOwnProperty;

// A rule is defined by an options object that contains two fields,
// `numRequestsAllowed` which is the number of events allowed per interval, and
// an `intervalTime` which is the amount of time in milliseconds before the
// rate limit restarts its internal counters, and by a matchers object. A
// matchers object is a POJO that contains a set of keys with values that
// define the entire set of inputs that match for each key. The values can
// either be null (optional), a primitive or a function that returns a boolean
// of whether the provided input's value matches for this key.
//
// Rules are uniquely assigned an `id` and they store a dictionary of counters,
// which are records used to keep track of inputs that match the rule. If a
// counter reaches the `numRequestsAllowed` within a given `intervalTime`, a
// rate limit is reached and future inputs that map to that counter will
// result in errors being returned to the client.
class Rule {
  constructor(options, matchers) {
    this.id = Random.id();
    this.options = options;
    this._matchers = matchers;
    this._lastResetTime = new Date().getTime();

    // Dictionary of input keys to counters
    this.counters = {};
  }
  // Determine if this rule applies to the given input by comparing all
  // rule.matchers. If the match fails, search short circuits instead of
  // iterating through all matchers.
  match(input) {
    return Object.entries(this._matchers).every(_ref => {
      let [key, matcher] = _ref;
      if (matcher !== null) {
        if (!hasOwn.call(input, key)) {
          return false;
        } else if (typeof matcher === 'function') {
          if (!matcher(input[key])) {
            return false;
          }
        } else if (matcher !== input[key]) {
          return false;
        }
      }
      return true;
    });
  }

  // Generates unique key string for provided input by concatenating all the
  // keys in the matcher with the corresponding values in the input.
  // Only called if rule matches input.
  _generateKeyString(input) {
    return Object.entries(this._matchers).filter(_ref2 => {
      let [key] = _ref2;
      return this._matchers[key] !== null;
    }).reduce((returnString, _ref3) => {
      let [key, matcher] = _ref3;
      if (typeof matcher === 'function') {
        if (matcher(input[key])) {
          returnString += key + input[key];
        }
      } else {
        returnString += key + input[key];
      }
      return returnString;
    }, '');
  }

  // Applies the provided input and returns the key string, time since counters
  // were last reset and time to next reset.
  apply(input) {
    const key = this._generateKeyString(input);
    const timeSinceLastReset = new Date().getTime() - this._lastResetTime;
    const timeToNextReset = this.options.intervalTime - timeSinceLastReset;
    return {
      key,
      timeSinceLastReset,
      timeToNextReset
    };
  }

  // Reset counter dictionary for this specific rule. Called once the
  // timeSinceLastReset has exceeded the intervalTime. _lastResetTime is
  // set to be the current time in milliseconds.
  resetCounter() {
    // Delete the old counters dictionary to allow for garbage collection
    this.counters = {};
    this._lastResetTime = new Date().getTime();
  }
  _executeCallback(reply, ruleInput) {
    try {
      if (this.options.callback) {
        this.options.callback(reply, ruleInput);
      }
    } catch (e) {
      // Do not throw error here
      console.error(e);
    }
  }
}
class RateLimiter {
  // Initialize rules to be an empty dictionary.
  constructor() {
    // Dictionary of all rules associated with this RateLimiter, keyed by their
    // id. Each rule object stores the rule pattern, number of events allowed,
    // last reset time and the rule reset interval in milliseconds.

    this.rules = {};
  }

  /**
  * Checks if this input has exceeded any rate limits.
  * @param  {object} input dictionary containing key-value pairs of attributes
  * that match to rules
  * @return {object} Returns object of following structure
  * { 'allowed': boolean - is this input allowed
  *   'timeToReset': integer | Infinity - returns time until counters are reset
  *                   in milliseconds
  *   'numInvocationsLeft': integer | Infinity - returns number of calls left
  *   before limit is reached
  * }
  * If multiple rules match, the least number of invocations left is returned.
  * If the rate limit has been reached, the longest timeToReset is returned.
  */
  check(input) {
    const reply = {
      allowed: true,
      timeToReset: 0,
      numInvocationsLeft: Infinity
    };
    const matchedRules = this._findAllMatchingRules(input);
    matchedRules.forEach(rule => {
      const ruleResult = rule.apply(input);
      let numInvocations = rule.counters[ruleResult.key];
      if (ruleResult.timeToNextReset < 0) {
        // Reset all the counters since the rule has reset
        rule.resetCounter();
        ruleResult.timeSinceLastReset = new Date().getTime() - rule._lastResetTime;
        ruleResult.timeToNextReset = rule.options.intervalTime;
        numInvocations = 0;
      }
      if (numInvocations > rule.options.numRequestsAllowed) {
        // Only update timeToReset if the new time would be longer than the
        // previously set time. This is to ensure that if this input triggers
        // multiple rules, we return the longest period of time until they can
        // successfully make another call
        if (reply.timeToReset < ruleResult.timeToNextReset) {
          reply.timeToReset = ruleResult.timeToNextReset;
        }
        reply.allowed = false;
        reply.numInvocationsLeft = 0;
        reply.ruleId = rule.id;
        rule._executeCallback(reply, input);
      } else {
        // If this is an allowed attempt and we haven't failed on any of the
        // other rules that match, update the reply field.
        if (rule.options.numRequestsAllowed - numInvocations < reply.numInvocationsLeft && reply.allowed) {
          reply.timeToReset = ruleResult.timeToNextReset;
          reply.numInvocationsLeft = rule.options.numRequestsAllowed - numInvocations;
        }
        reply.ruleId = rule.id;
        rule._executeCallback(reply, input);
      }
    });
    return reply;
  }

  /**
  * Adds a rule to dictionary of rules that are checked against on every call.
  * Only inputs that pass all of the rules will be allowed. Returns unique rule
  * id that can be passed to `removeRule`.
  * @param {object} rule    Input dictionary defining certain attributes and
  * rules associated with them.
  * Each attribute's value can either be a value, a function or null. All
  * functions must return a boolean of whether the input is matched by that
  * attribute's rule or not
  * @param {integer} numRequestsAllowed Optional. Number of events allowed per
  * interval. Default = 10.
  * @param {integer} intervalTime Optional. Number of milliseconds before
  * rule's counters are reset. Default = 1000.
  * @param {function} callback Optional. Function to be called after a
  * rule is executed. Two objects will be passed to this function.
  * The first one is the result of RateLimiter.prototype.check
  * The second is the input object of the rule, it has the following structure:
  * {
  *   'type': string - either 'method' or 'subscription'
  *   'name': string - the name of the method or subscription being called
  *   'userId': string - the user ID attempting the method or subscription
  *   'connectionId': string - a string representing the user's DDP connection
  *   'clientAddress': string - the IP address of the user
  * }
  * @return {string} Returns unique rule id
  */
  addRule(rule, numRequestsAllowed, intervalTime, callback) {
    const options = {
      numRequestsAllowed: numRequestsAllowed || DEFAULT_REQUESTS_PER_INTERVAL,
      intervalTime: intervalTime || DEFAULT_INTERVAL_TIME_IN_MILLISECONDS,
      callback: callback && Meteor.bindEnvironment(callback)
    };
    const newRule = new Rule(options, rule);
    this.rules[newRule.id] = newRule;
    return newRule.id;
  }

  /**
  * Increment counters in every rule that match to this input
  * @param  {object} input Dictionary object containing attributes that may
  * match to rules
  */
  increment(input) {
    // Only increment rule counters that match this input
    const matchedRules = this._findAllMatchingRules(input);
    matchedRules.forEach(rule => {
      const ruleResult = rule.apply(input);
      if (ruleResult.timeSinceLastReset > rule.options.intervalTime) {
        // Reset all the counters since the rule has reset
        rule.resetCounter();
      }

      // Check whether the key exists, incrementing it if so or otherwise
      // adding the key and setting its value to 1
      if (hasOwn.call(rule.counters, ruleResult.key)) {
        rule.counters[ruleResult.key]++;
      } else {
        rule.counters[ruleResult.key] = 1;
      }
    });
  }

  // Returns an array of all rules that apply to provided input
  _findAllMatchingRules(input) {
    return Object.values(this.rules).filter(rule => rule.match(input));
  }

  /**
   * Provides a mechanism to remove rules from the rate limiter. Returns boolean
   * about success.
   * @param  {string} id Rule id returned from #addRule
   * @return {boolean} Returns true if rule was found and deleted, else false.
   */
  removeRule(id) {
    if (this.rules[id]) {
      delete this.rules[id];
      return true;
    }
    return false;
  }
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

}}}}},{
  "extensions": [
    ".js",
    ".json"
  ]
});

var exports = require("/node_modules/meteor/rate-limit/rate-limit.js");

/* Exports */
Package._define("rate-limit", exports, {
  RateLimiter: RateLimiter
});

})();

//# sourceURL=meteor://💻app/packages/rate-limit.js
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1ldGVvcjovL/CfkrthcHAvcGFja2FnZXMvcmF0ZS1saW1pdC9yYXRlLWxpbWl0LmpzIl0sIm5hbWVzIjpbIm1vZHVsZSIsImV4cG9ydCIsIlJhdGVMaW1pdGVyIiwiTWV0ZW9yIiwibGluayIsInYiLCJSYW5kb20iLCJERUZBVUxUX0lOVEVSVkFMX1RJTUVfSU5fTUlMTElTRUNPTkRTIiwiREVGQVVMVF9SRVFVRVNUU19QRVJfSU5URVJWQUwiLCJoYXNPd24iLCJPYmplY3QiLCJwcm90b3R5cGUiLCJoYXNPd25Qcm9wZXJ0eSIsIlJ1bGUiLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJtYXRjaGVycyIsImlkIiwiX21hdGNoZXJzIiwiX2xhc3RSZXNldFRpbWUiLCJEYXRlIiwiZ2V0VGltZSIsImNvdW50ZXJzIiwibWF0Y2giLCJpbnB1dCIsImVudHJpZXMiLCJldmVyeSIsIl9yZWYiLCJrZXkiLCJtYXRjaGVyIiwiY2FsbCIsIl9nZW5lcmF0ZUtleVN0cmluZyIsImZpbHRlciIsIl9yZWYyIiwicmVkdWNlIiwicmV0dXJuU3RyaW5nIiwiX3JlZjMiLCJhcHBseSIsInRpbWVTaW5jZUxhc3RSZXNldCIsInRpbWVUb05leHRSZXNldCIsImludGVydmFsVGltZSIsInJlc2V0Q291bnRlciIsIl9leGVjdXRlQ2FsbGJhY2siLCJyZXBseSIsInJ1bGVJbnB1dCIsImNhbGxiYWNrIiwiZSIsImNvbnNvbGUiLCJlcnJvciIsInJ1bGVzIiwiY2hlY2siLCJhbGxvd2VkIiwidGltZVRvUmVzZXQiLCJudW1JbnZvY2F0aW9uc0xlZnQiLCJJbmZpbml0eSIsIm1hdGNoZWRSdWxlcyIsIl9maW5kQWxsTWF0Y2hpbmdSdWxlcyIsImZvckVhY2giLCJydWxlIiwicnVsZVJlc3VsdCIsIm51bUludm9jYXRpb25zIiwibnVtUmVxdWVzdHNBbGxvd2VkIiwicnVsZUlkIiwiYWRkUnVsZSIsImJpbmRFbnZpcm9ubWVudCIsIm5ld1J1bGUiLCJpbmNyZW1lbnQiLCJ2YWx1ZXMi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QUFxQkEsQ0FBQ2hDLEtBQUssRUFBRTtJQUMzQixPQUFPZCxNQUFNLENBQUN5RCxNQUFNLENBQUMsSUFBSSxDQUFDbEIsS0FBSyxDQUFDLENBQUNqQixNQUFNLENBQUMwQixJQUFJLElBQUlBLElBQUksQ0FBQ25DLEtBQUssQ0FBQ0MsS0FBSyxDQUFDLENBQUM7RUFDcEU7O0VBRUE7QUFDRjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0U0QyxVQUFVQSxDQUFDbkQsRUFBRSxFQUFFO0lBQ2IsSUFBSSxJQUFJLENBQUNnQyxLQUFLLENBQUNoQyxFQUFFLENBQUMsRUFBRTtNQUNsQixPQUFPLElBQUksQ0FBQ2dDLEtBQUssQ0FBQ2hDLEVBQUUsQ0FBQztNQUNyQixPQUFPLElBQUk7SUFDYjtJQUNBLE9BQU8sS0FBSztFQUNkO0FBQ0YsQyIsImZpbGUiOiIvcGFja2FnZXMvcmF0ZS1saW1pdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE1ldGVvciB9IGZyb20gJ21ldGVvci9tZXRlb3InO1xuaW1wb3J0IHsgUmFuZG9tIH0gZnJvbSAnbWV0ZW9yL3JhbmRvbSc7XG5cbi8vIERlZmF1bHQgdGltZSBpbnRlcnZhbCAoaW4gbWlsbGlzZWNvbmRzKSB0byByZXNldCByYXRlIGxpbWl0IGNvdW50ZXJzXG5jb25zdCBERUZBVUxUX0lOVEVSVkFMX1RJTUVfSU5fTUlMTElTRUNPTkRTID0gMTAwMDtcbi8vIERlZmF1bHQgbnVtYmVyIG9mIGV2ZW50cyBhbGxvd2VkIHBlciB0aW1lIGludGVydmFsXG5jb25zdCBERUZBVUxUX1JFUVVFU1RTX1BFUl9JTlRFUlZBTCA9IDEwO1xuXG5jb25zdCBoYXNPd24gPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4vLyBBIHJ1bGUgaXMgZGVmaW5lZCBieSBhbiBvcHRpb25zIG9iamVjdCB0aGF0IGNvbnRhaW5zIHR3byBmaWVsZHMsXG4vLyBgbnVtUmVxdWVzdHNBbGxvd2VkYCB3aGljaCBpcyB0aGUgbnVtYmVyIG9mIGV2ZW50cyBhbGxvd2VkIHBlciBpbnRlcnZhbCwgYW5kXG4vLyBhbiBgaW50ZXJ2YWxUaW1lYCB3aGljaCBpcyB0aGUgYW1vdW50IG9mIHRpbWUgaW4gbWlsbGlzZWNvbmRzIGJlZm9yZSB0aGVcbi8vIHJhdGUgbGltaXQgcmVzdGFydHMgaXRzIGludGVybmFsIGNvdW50ZXJzLCBhbmQgYnkgYSBtYXRjaGVycyBvYmplY3QuIEFcbi8vIG1hdGNoZXJzIG9iamVjdCBpcyBhIFBPSk8gdGhhdCBjb250YWlucyBhIHNldCBvZiBrZXlzIHdpdGggdmFsdWVzIHRoYXRcbi8vIGRlZmluZSB0aGUgZW50aXJlIHNldCBvZiBpbnB1dHMgdGhhdCBtYXRjaCBmb3IgZWFjaCBrZXkuIFRoZSB2YWx1ZXMgY2FuXG4vLyBlaXRoZXIgYmUgbnVsbCAob3B0aW9uYWwpLCBhIHByaW1pdGl2ZSBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhIGJvb2xlYW5cbi8vIG9mIHdoZXRoZXIgdGhlIHByb3ZpZGVkIGlucHV0J3MgdmFsdWUgbWF0Y2hlcyBmb3IgdGhpcyBrZXkuXG4vL1xuLy8gUnVsZXMgYXJlIHVuaXF1ZWx5IGFzc2lnbmVkIGFuIGBpZGAgYW5kIHRoZXkgc3RvcmUgYSBkaWN0aW9uYXJ5IG9mIGNvdW50ZXJzLFxuLy8gd2hpY2ggYXJlIHJlY29yZHMgdXNlZCB0byBrZWVwIHRyYWNrIG9mIGlucHV0cyB0aGF0IG1hdGNoIHRoZSBydWxlLiBJZiBhXG4vLyBjb3VudGVyIHJlYWNoZXMgdGhlIGBudW1SZXF1ZXN0c0FsbG93ZWRgIHdpdGhpbiBhIGdpdmVuIGBpbnRlcnZhbFRpbWVgLCBhXG4vLyByYXRlIGxpbWl0IGlzIHJlYWNoZWQgYW5kIGZ1dHVyZSBpbnB1dHMgdGhhdCBtYXAgdG8gdGhhdCBjb3VudGVyIHdpbGxcbi8vIHJlc3VsdCBpbiBlcnJvcnMgYmVpbmcgcmV0dXJuZWQgdG8gdGhlIGNsaWVudC5cbmNsYXNzIFJ1bGUge1xuICBjb25zdHJ1Y3RvcihvcHRpb25zLCBtYXRjaGVycykge1xuICAgIHRoaXMuaWQgPSBSYW5kb20uaWQoKTtcblxuICAgIHRoaXMub3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgICB0aGlzLl9tYXRjaGVycyA9IG1hdGNoZXJzO1xuXG4gICAgdGhpcy5fbGFzdFJlc2V0VGltZSA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuXG4gICAgLy8gRGljdGlvbmFyeSBvZiBpbnB1dCBrZXlzIHRvIGNvdW50ZXJzXG4gICAgdGhpcy5jb3VudGVycyA9IHt9O1xuICB9XG4gIC8vIERldGVybWluZSBpZiB0aGlzIHJ1bGUgYXBwbGllcyB0byB0aGUgZ2l2ZW4gaW5wdXQgYnkgY29tcGFyaW5nIGFsbFxuICAvLyBydWxlLm1hdGNoZXJzLiBJZiB0aGUgbWF0Y2ggZmFpbHMsIHNlYXJjaCBzaG9ydCBjaXJjdWl0cyBpbnN0ZWFkIG9mXG4gIC8vIGl0ZXJhdGluZyB0aHJvdWdoIGFsbCBtYXRjaGVycy5cbiAgbWF0Y2goaW5wdXQpIHtcbiAgICByZXR1cm4gT2JqZWN0XG4gICAgICAuZW50cmllcyh0aGlzLl9tYXRjaGVycylcbiAgICAgIC5ldmVyeSgoW2tleSwgbWF0Y2hlcl0pID0+IHtcbiAgICAgICAgaWYgKG1hdGNoZXIgIT09IG51bGwpIHtcbiAgICAgICAgICBpZiAoIWhhc093bi5jYWxsKGlucHV0LCBrZXkpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbWF0Y2hlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgaWYgKCEobWF0Y2hlcihpbnB1dFtrZXldKSkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAobWF0Y2hlciAhPT0gaW5wdXRba2V5XSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLy8gR2VuZXJhdGVzIHVuaXF1ZSBrZXkgc3RyaW5nIGZvciBwcm92aWRlZCBpbnB1dCBieSBjb25jYXRlbmF0aW5nIGFsbCB0aGVcbiAgLy8ga2V5cyBpbiB0aGUgbWF0Y2hlciB3aXRoIHRoZSBjb3JyZXNwb25kaW5nIHZhbHVlcyBpbiB0aGUgaW5wdXQuXG4gIC8vIE9ubHkgY2FsbGVkIGlmIHJ1bGUgbWF0Y2hlcyBpbnB1dC5cbiAgX2dlbmVyYXRlS2V5U3RyaW5nKGlucHV0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5lbnRyaWVzKHRoaXMuX21hdGNoZXJzKVxuICAgICAgLmZpbHRlcigoW2tleV0pID0+IHRoaXMuX21hdGNoZXJzW2tleV0gIT09IG51bGwpXG4gICAgICAucmVkdWNlKChyZXR1cm5TdHJpbmcsIFtrZXksIG1hdGNoZXJdKSA9PiB7XG4gICAgICAgIGlmICh0eXBlb2YgbWF0Y2hlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgIGlmIChtYXRjaGVyKGlucHV0W2tleV0pKSB7XG4gICAgICAgICAgICByZXR1cm5TdHJpbmcgKz0ga2V5ICsgaW5wdXRba2V5XTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuU3RyaW5nICs9IGtleSArIGlucHV0W2tleV07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJldHVyblN0cmluZztcbiAgICAgIH0sICcnKTtcbiAgfVxuXG4gIC8vIEFwcGxpZXMgdGhlIHByb3ZpZGVkIGlucHV0IGFuZCByZXR1cm5zIHRoZSBrZXkgc3RyaW5nLCB0aW1lIHNpbmNlIGNvdW50ZXJzXG4gIC8vIHdlcmUgbGFzdCByZXNldCBhbmQgdGltZSB0byBuZXh0IHJlc2V0LlxuICBhcHBseShpbnB1dCkge1xuICAgIGNvbnN0IGtleSA9IHRoaXMuX2dlbmVyYXRlS2V5U3RyaW5nKGlucHV0KTtcbiAgICBjb25zdCB0aW1lU2luY2VMYXN0UmVzZXQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtIHRoaXMuX2xhc3RSZXNldFRpbWU7XG4gICAgY29uc3QgdGltZVRvTmV4dFJlc2V0ID0gdGhpcy5vcHRpb25zLmludGVydmFsVGltZSAtIHRpbWVTaW5jZUxhc3RSZXNldDtcbiAgICByZXR1cm4ge1xuICAgICAga2V5LFxuICAgICAgdGltZVNpbmNlTGFzdFJlc2V0LFxuICAgICAgdGltZVRvTmV4dFJlc2V0LFxuICAgIH07XG4gIH1cblxuICAvLyBSZXNldCBjb3VudGVyIGRpY3Rpb25hcnkgZm9yIHRoaXMgc3BlY2lmaWMgcnVsZS4gQ2FsbGVkIG9uY2UgdGhlXG4gIC8vIHRpbWVTaW5jZUxhc3RSZXNldCBoYXMgZXhjZWVkZWQgdGhlIGludGVydmFsVGltZS4gX2xhc3RSZXNldFRpbWUgaXNcbiAgLy8gc2V0IHRvIGJlIHRoZSBjdXJyZW50IHRpbWUgaW4gbWlsbGlzZWNvbmRzLlxuICByZXNldENvdW50ZXIoKSB7XG4gICAgLy8gRGVsZXRlIHRoZSBvbGQgY291bnRlcnMgZGljdGlvbmFyeSB0byBhbGxvdyBmb3IgZ2FyYmFnZSBjb2xsZWN0aW9uXG4gICAgdGhpcy5jb3VudGVycyA9IHt9O1xuICAgIHRoaXMuX2xhc3RSZXNldFRpbWUgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgfVxuXG4gIF9leGVjdXRlQ2FsbGJhY2socmVwbHksIHJ1bGVJbnB1dCkge1xuICAgIHRyeSB7XG4gICAgICBpZiAodGhpcy5vcHRpb25zLmNhbGxiYWNrKSB7XG4gICAgICAgIHRoaXMub3B0aW9ucy5jYWxsYmFjayhyZXBseSwgcnVsZUlucHV0KTtcbiAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAvLyBEbyBub3QgdGhyb3cgZXJyb3IgaGVyZVxuICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB9XG4gIH1cbn1cblxuY2xhc3MgUmF0ZUxpbWl0ZXIge1xuICAvLyBJbml0aWFsaXplIHJ1bGVzIHRvIGJlIGFuIGVtcHR5IGRpY3Rpb25hcnkuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIC8vIERpY3Rpb25hcnkgb2YgYWxsIHJ1bGVzIGFzc29jaWF0ZWQgd2l0aCB0aGlzIFJhdGVMaW1pdGVyLCBrZXllZCBieSB0aGVpclxuICAgIC8vIGlkLiBFYWNoIHJ1bGUgb2JqZWN0IHN0b3JlcyB0aGUgcnVsZSBwYXR0ZXJuLCBudW1iZXIgb2YgZXZlbnRzIGFsbG93ZWQsXG4gICAgLy8gbGFzdCByZXNldCB0aW1lIGFuZCB0aGUgcnVsZSByZXNldCBpbnRlcnZhbCBpbiBtaWxsaXNlY29uZHMuXG5cbiAgICB0aGlzLnJ1bGVzID0ge307XG4gIH1cblxuICAvKipcbiAgKiBDaGVja3MgaWYgdGhpcyBpbnB1dCBoYXMgZXhjZWVkZWQgYW55IHJhdGUgbGltaXRzLlxuICAqIEBwYXJhbSAge29iamVjdH0gaW5wdXQgZGljdGlvbmFyeSBjb250YWluaW5nIGtleS12YWx1ZSBwYWlycyBvZiBhdHRyaWJ1dGVzXG4gICogdGhhdCBtYXRjaCB0byBydWxlc1xuICAqIEByZXR1cm4ge29iamVjdH0gUmV0dXJucyBvYmplY3Qgb2YgZm9sbG93aW5nIHN0cnVjdHVyZVxuICAqIHsgJ2FsbG93ZWQnOiBib29sZWFuIC0gaXMgdGhpcyBpbnB1dCBhbGxvd2VkXG4gICogICAndGltZVRvUmVzZXQnOiBpbnRlZ2VyIHwgSW5maW5pdHkgLSByZXR1cm5zIHRpbWUgdW50aWwgY291bnRlcnMgYXJlIHJlc2V0XG4gICogICAgICAgICAgICAgICAgICAgaW4gbWlsbGlzZWNvbmRzXG4gICogICAnbnVtSW52b2NhdGlvbnNMZWZ0JzogaW50ZWdlciB8IEluZmluaXR5IC0gcmV0dXJucyBudW1iZXIgb2YgY2FsbHMgbGVmdFxuICAqICAgYmVmb3JlIGxpbWl0IGlzIHJlYWNoZWRcbiAgKiB9XG4gICogSWYgbXVsdGlwbGUgcnVsZXMgbWF0Y2gsIHRoZSBsZWFzdCBudW1iZXIgb2YgaW52b2NhdGlvbnMgbGVmdCBpcyByZXR1cm5lZC5cbiAgKiBJZiB0aGUgcmF0ZSBsaW1pdCBoYXMgYmVlbiByZWFjaGVkLCB0aGUgbG9uZ2VzdCB0aW1lVG9SZXNldCBpcyByZXR1cm5lZC5cbiAgKi9cbiAgY2hlY2soaW5wdXQpIHtcbiAgICBjb25zdCByZXBseSA9IHtcbiAgICAgIGFsbG93ZWQ6IHRydWUsXG4gICAgICB0aW1lVG9SZXNldDogMCxcbiAgICAgIG51bUludm9jYXRpb25zTGVmdDogSW5maW5pdHksXG4gICAgfTtcblxuICAgIGNvbnN0IG1hdGNoZWRSdWxlcyA9IHRoaXMuX2ZpbmRBbGxNYXRjaGluZ1J1bGVzKGlucHV0KTtcbiAgICBtYXRjaGVkUnVsZXMuZm9yRWFjaCgocnVsZSkgPT4ge1xuICAgICAgY29uc3QgcnVsZVJlc3VsdCA9IHJ1bGUuYXBwbHkoaW5wdXQpO1xuICAgICAgbGV0IG51bUludm9jYXRpb25zID0gcnVsZS5jb3VudGVyc1tydWxlUmVzdWx0LmtleV07XG5cbiAgICAgIGlmIChydWxlUmVzdWx0LnRpbWVUb05leHRSZXNldCA8IDApIHtcbiAgICAgICAgLy8gUmVzZXQgYWxsIHRoZSBjb3VudGVycyBzaW5jZSB0aGUgcnVsZSBoYXMgcmVzZXRcbiAgICAgICAgcnVsZS5yZXNldENvdW50ZXIoKTtcbiAgICAgICAgcnVsZVJlc3VsdC50aW1lU2luY2VMYXN0UmVzZXQgPSBuZXcgRGF0ZSgpLmdldFRpbWUoKSAtXG4gICAgICAgICAgcnVsZS5fbGFzdFJlc2V0VGltZTtcbiAgICAgICAgcnVsZVJlc3VsdC50aW1lVG9OZXh0UmVzZXQgPSBydWxlLm9wdGlvbnMuaW50ZXJ2YWxUaW1lO1xuICAgICAgICBudW1JbnZvY2F0aW9ucyA9IDA7XG4gICAgICB9XG5cbiAgICAgIGlmIChudW1JbnZvY2F0aW9ucyA+IHJ1bGUub3B0aW9ucy5udW1SZXF1ZXN0c0FsbG93ZWQpIHtcbiAgICAgICAgLy8gT25seSB1cGRhdGUgdGltZVRvUmVzZXQgaWYgdGhlIG5ldyB0aW1lIHdvdWxkIGJlIGxvbmdlciB0aGFuIHRoZVxuICAgICAgICAvLyBwcmV2aW91c2x5IHNldCB0aW1lLiBUaGlzIGlzIHRvIGVuc3VyZSB0aGF0IGlmIHRoaXMgaW5wdXQgdHJpZ2dlcnNcbiAgICAgICAgLy8gbXVsdGlwbGUgcnVsZXMsIHdlIHJldHVybiB0aGUgbG9uZ2VzdCBwZXJpb2Qgb2YgdGltZSB1bnRpbCB0aGV5IGNhblxuICAgICAgICAvLyBzdWNjZXNzZnVsbHkgbWFrZSBhbm90aGVyIGNhbGxcbiAgICAgICAgaWYgKHJlcGx5LnRpbWVUb1Jlc2V0IDwgcnVsZVJlc3VsdC50aW1lVG9OZXh0UmVzZXQpIHtcbiAgICAgICAgICByZXBseS50aW1lVG9SZXNldCA9IHJ1bGVSZXN1bHQudGltZVRvTmV4dFJlc2V0O1xuICAgICAgICB9XG4gICAgICAgIHJlcGx5LmFsbG93ZWQgPSBmYWxzZTtcbiAgICAgICAgcmVwbHkubnVtSW52b2NhdGlvbnNMZWZ0ID0gMDtcbiAgICAgICAgcmVwbHkucnVsZUlkID0gcnVsZS5pZDtcbiAgICAgICAgcnVsZS5fZXhlY3V0ZUNhbGxiYWNrKHJlcGx5LCBpbnB1dCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBJZiB0aGlzIGlzIGFuIGFsbG93ZWQgYXR0ZW1wdCBhbmQgd2UgaGF2ZW4ndCBmYWlsZWQgb24gYW55IG9mIHRoZVxuICAgICAgICAvLyBvdGhlciBydWxlcyB0aGF0IG1hdGNoLCB1cGRhdGUgdGhlIHJlcGx5IGZpZWxkLlxuICAgICAgICBpZiAocnVsZS5vcHRpb25zLm51bVJlcXVlc3RzQWxsb3dlZCAtIG51bUludm9jYXRpb25zIDxcbiAgICAgICAgICByZXBseS5udW1JbnZvY2F0aW9uc0xlZnQgJiYgcmVwbHkuYWxsb3dlZCkge1xuICAgICAgICAgIHJlcGx5LnRpbWVUb1Jlc2V0ID0gcnVsZVJlc3VsdC50aW1lVG9OZXh0UmVzZXQ7XG4gICAgICAgICAgcmVwbHkubnVtSW52b2NhdGlvbnNMZWZ0ID0gcnVsZS5vcHRpb25zLm51bVJlcXVlc3RzQWxsb3dlZCAtXG4gICAgICAgICAgICBudW1JbnZvY2F0aW9ucztcbiAgICAgICAgfVxuICAgICAgICByZXBseS5ydWxlSWQgPSBydWxlLmlkO1xuICAgICAgICBydWxlLl9leGVjdXRlQ2FsbGJhY2socmVwbHksIGlucHV0KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gcmVwbHk7XG4gIH1cblxuICAvKipcbiAgKiBBZGRzIGEgcnVsZSB0byBkaWN0aW9uYXJ5IG9mIHJ1bGVzIHRoYXQgYXJlIGNoZWNrZWQgYWdhaW5zdCBvbiBldmVyeSBjYWxsLlxuICAqIE9ubHkgaW5wdXRzIHRoYXQgcGFzcyBhbGwgb2YgdGhlIHJ1bGVzIHdpbGwgYmUgYWxsb3dlZC4gUmV0dXJucyB1bmlxdWUgcnVsZVxuICAqIGlkIHRoYXQgY2FuIGJlIHBhc3NlZCB0byBgcmVtb3ZlUnVsZWAuXG4gICogQHBhcmFtIHtvYmplY3R9IHJ1bGUgICAgSW5wdXQgZGljdGlvbmFyeSBkZWZpbmluZyBjZXJ0YWluIGF0dHJpYnV0ZXMgYW5kXG4gICogcnVsZXMgYXNzb2NpYXRlZCB3aXRoIHRoZW0uXG4gICogRWFjaCBhdHRyaWJ1dGUncyB2YWx1ZSBjYW4gZWl0aGVyIGJlIGEgdmFsdWUsIGEgZnVuY3Rpb24gb3IgbnVsbC4gQWxsXG4gICogZnVuY3Rpb25zIG11c3QgcmV0dXJuIGEgYm9vbGVhbiBvZiB3aGV0aGVyIHRoZSBpbnB1dCBpcyBtYXRjaGVkIGJ5IHRoYXRcbiAgKiBhdHRyaWJ1dGUncyBydWxlIG9yIG5vdFxuICAqIEBwYXJhbSB7aW50ZWdlcn0gbnVtUmVxdWVzdHNBbGxvd2VkIE9wdGlvbmFsLiBOdW1iZXIgb2YgZXZlbnRzIGFsbG93ZWQgcGVyXG4gICogaW50ZXJ2YWwuIERlZmF1bHQgPSAxMC5cbiAgKiBAcGFyYW0ge2ludGVnZXJ9IGludGVydmFsVGltZSBPcHRpb25hbC4gTnVtYmVyIG9mIG1pbGxpc2Vjb25kcyBiZWZvcmVcbiAgKiBydWxlJ3MgY291bnRlcnMgYXJlIHJlc2V0LiBEZWZhdWx0ID0gMTAwMC5cbiAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFjayBPcHRpb25hbC4gRnVuY3Rpb24gdG8gYmUgY2FsbGVkIGFmdGVyIGFcbiAgKiBydWxlIGlzIGV4ZWN1dGVkLiBUd28gb2JqZWN0cyB3aWxsIGJlIHBhc3NlZCB0byB0aGlzIGZ1bmN0aW9uLlxuICAqIFRoZSBmaXJzdCBvbmUgaXMgdGhlIHJlc3VsdCBvZiBSYXRlTGltaXRlci5wcm90b3R5cGUuY2hlY2tcbiAgKiBUaGUgc2Vjb25kIGlzIHRoZSBpbnB1dCBvYmplY3Qgb2YgdGhlIHJ1bGUsIGl0IGhhcyB0aGUgZm9sbG93aW5nIHN0cnVjdHVyZTpcbiAgKiB7XG4gICogICAndHlwZSc6IHN0cmluZyAtIGVpdGhlciAnbWV0aG9kJyBvciAnc3Vic2NyaXB0aW9uJ1xuICAqICAgJ25hbWUnOiBzdHJpbmcgLSB0aGUgbmFtZSBvZiB0aGUgbWV0aG9kIG9yIHN1YnNjcmlwdGlvbiBiZWluZyBjYWxsZWRcbiAgKiAgICd1c2VySWQnOiBzdHJpbmcgLSB0aGUgdXNlciBJRCBhdHRlbXB0aW5nIHRoZSBtZXRob2Qgb3Igc3Vic2NyaXB0aW9uXG4gICogICAnY29ubmVjdGlvbklkJzogc3RyaW5nIC0gYSBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSB1c2VyJ3MgRERQIGNvbm5lY3Rpb25cbiAgKiAgICdjbGllbnRBZGRyZXNzJzogc3RyaW5nIC0gdGhlIElQIGFkZHJlc3Mgb2YgdGhlIHVzZXJcbiAgKiB9XG4gICogQHJldHVybiB7c3RyaW5nfSBSZXR1cm5zIHVuaXF1ZSBydWxlIGlkXG4gICovXG4gIGFkZFJ1bGUocnVsZSwgbnVtUmVxdWVzdHNBbGxvd2VkLCBpbnRlcnZhbFRpbWUsIGNhbGxiYWNrKSB7XG4gICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgIG51bVJlcXVlc3RzQWxsb3dlZDogbnVtUmVxdWVzdHNBbGxvd2VkIHx8IERFRkFVTFRfUkVRVUVTVFNfUEVSX0lOVEVSVkFMLFxuICAgICAgaW50ZXJ2YWxUaW1lOiBpbnRlcnZhbFRpbWUgfHwgREVGQVVMVF9JTlRFUlZBTF9USU1FX0lOX01JTExJU0VDT05EUyxcbiAgICAgIGNhbGxiYWNrOiBjYWxsYmFjayAmJiBNZXRlb3IuYmluZEVudmlyb25tZW50KGNhbGxiYWNrKSxcbiAgICB9O1xuXG4gICAgY29uc3QgbmV3UnVsZSA9IG5ldyBSdWxlKG9wdGlvbnMsIHJ1bGUpO1xuICAgIHRoaXMucnVsZXNbbmV3UnVsZS5pZF0gPSBuZXdSdWxlO1xuICAgIHJldHVybiBuZXdSdWxlLmlkO1xuICB9XG5cbiAgLyoqXG4gICogSW5jcmVtZW50IGNvdW50ZXJzIGluIGV2ZXJ5IHJ1bGUgdGhhdCBtYXRjaCB0byB0aGlzIGlucHV0XG4gICogQHBhcmFtICB7b2JqZWN0fSBpbnB1dCBEaWN0aW9uYXJ5IG9iamVjdCBjb250YWluaW5nIGF0dHJpYnV0ZXMgdGhhdCBtYXlcbiAgKiBtYXRjaCB0byBydWxlc1xuICAqL1xuICBpbmNyZW1lbnQoaW5wdXQpIHtcbiAgICAvLyBPbmx5IGluY3JlbWVudCBydWxlIGNvdW50ZXJzIHRoYXQgbWF0Y2ggdGhpcyBpbnB1dFxuICAgIGNvbnN0IG1hdGNoZWRSdWxlcyA9IHRoaXMuX2ZpbmRBbGxNYXRjaGluZ1J1bGVzKGlucHV0KTtcbiAgICBtYXRjaGVkUnVsZXMuZm9yRWFjaCgocnVsZSkgPT4ge1xuICAgICAgY29uc3QgcnVsZVJlc3VsdCA9IHJ1bGUuYXBwbHkoaW5wdXQpO1xuXG4gICAgICBpZiAocnVsZVJlc3VsdC50aW1lU2luY2VMYXN0UmVzZXQgPiBydWxlLm9wdGlvbnMuaW50ZXJ2YWxUaW1lKSB7XG4gICAgICAgIC8vIFJlc2V0IGFsbCB0aGUgY291bnRlcnMgc2luY2UgdGhlIHJ1bGUgaGFzIHJlc2V0XG4gICAgICAgIHJ1bGUucmVzZXRDb3VudGVyKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIENoZWNrIHdoZXRoZXIgdGhlIGtleSBleGlzdHMsIGluY3JlbWVudGluZyBpdCBpZiBzbyBvciBvdGhlcndpc2VcbiAgICAgIC8vIGFkZGluZyB0aGUga2V5IGFuZCBzZXR0aW5nIGl0cyB2YWx1ZSB0byAxXG4gICAgICBpZiAoaGFzT3duLmNhbGwocnVsZS5jb3VudGVycywgcnVsZVJlc3VsdC5rZXkpKSB7XG4gICAgICAgIHJ1bGUuY291bnRlcnNbcnVsZVJlc3VsdC5rZXldKys7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBydWxlLmNvdW50ZXJzW3J1bGVSZXN1bHQua2V5XSA9IDE7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICAvLyBSZXR1cm5zIGFuIGFycmF5IG9mIGFsbCBydWxlcyB0aGF0IGFwcGx5IHRvIHByb3ZpZGVkIGlucHV0XG4gIF9maW5kQWxsTWF0Y2hpbmdSdWxlcyhpbnB1dCkge1xuICAgIHJldHVybiBPYmplY3QudmFsdWVzKHRoaXMucnVsZXMpLmZpbHRlcihydWxlID0+IHJ1bGUubWF0Y2goaW5wdXQpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBQcm92aWRlcyBhIG1lY2hhbmlzbSB0byByZW1vdmUgcnVsZXMgZnJvbSB0aGUgcmF0ZSBsaW1pdGVyLiBSZXR1cm5zIGJvb2xlYW5cbiAgICogYWJvdXQgc3VjY2Vzcy5cbiAgICogQHBhcmFtICB7c3RyaW5nfSBpZCBSdWxlIGlkIHJldHVybmVkIGZyb20gI2FkZFJ1bGVcbiAgICogQHJldHVybiB7Ym9vbGVhbn0gUmV0dXJucyB0cnVlIGlmIHJ1bGUgd2FzIGZvdW5kIGFuZCBkZWxldGVkLCBlbHNlIGZhbHNlLlxuICAgKi9cbiAgcmVtb3ZlUnVsZShpZCkge1xuICAgIGlmICh0aGlzLnJ1bGVzW2lkXSkge1xuICAgICAgZGVsZXRlIHRoaXMucnVsZXNbaWRdO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG5leHBvcnQgeyBSYXRlTGltaXRlciB9O1xuIl19
