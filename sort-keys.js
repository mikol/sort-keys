(function (_root) {
// -----------------------------------------------------------------------------

'use strict';

function factory() {
  /**
   * Recursively sorts all JavaScript object properties into ES6 “own property
   * keys” traversal order so that when properties are enumerated by other
   * operations like `JSON.stringify()`, they are enumerated deterministically.
   *
   * Prior to ES6, enumeration order for object keys was unspecified. ES6
   * specifies that all 32-bit integer indices (`'0'`, `'1'`, `'2'`, and so on)
   * be enumerated in ascending numerical order, followed by string keys (`'a'`,
   * `'01'`, and so on) in ascending alphabetical order. But only for certain
   * types of enumeration (for example: `Refelect.ownKeys()`, not
   * `Object.keys()`). Ultimately, enumeration order is determined by each
   * JavaScript engine, but extracting, sorting, and re-inserting keys should
   * yield a run-time consistent enumeration order for like-objects.
   *
   * @param {*} root - The value to process; usually this is an object or an
   *     array that will be processed recursively, but it can be any other legal
   *     JavaScript value as well.
   * @param {=function((number|string), *)} [replacer] - A callback that is
   *     passed two arguments `(key, value)` as well as their containing object
   *     bound to the `this` keyword; the callback should examine its arguments
   *     and return the original value to keep it, a new value to replace it, or
   *     `undefined` to wipe it.
   *
   * @return {*} A copy of the original value `root` with its properties (and
   *     all of its descendant properties inserted in canonical order) or, if
   *     `root` is *not* an object or an array, the original value unmodified
   *     (unless `replacer` modifies it).
   *
   * @see http://goo.gl/BvWj6y
   * @see http://goo.gl/mDMtzB
   */
  function sortKeys(root, replacer) {
    var hasReplacer = typeof replacer === 'function';
    var objects = [];
    var sorted = [];

    return (function sortKeysFn(key, value) {
      if (hasReplacer) {
        value = replacer.call(this, key, value);
      }

      if (isOwnPropertyKeyStore(value)) {
        var i = objects.indexOf(value);
        if (i > -1) {
          // `value` is the start of a cycle. Return its computed result.
          return sorted[i];
        }

        var nextKey;
        var nextValue;
        var ni;
        var result;

        if (value.constructor === Array) {
          ni = value.length;
          result = new Array(ni);

          for (i = 0; i < ni; ++i) {
            nextKey = i;
            nextValue = value[i];

            result[nextKey] = sortKeysFn.call(value, nextKey, nextValue);
          }
        } else {
          var keys = Object.keys(value).sort(compareOwnPropertyKeys);
          result = {};

          for (i = 0, ni = keys.length; i < ni; ++i) {
            nextKey = keys[i];
            nextValue = value[nextKey];

            result[nextKey] = sortKeysFn.call(value, nextKey, nextValue);
          }
        }

        objects.push(value);
        sorted.push(result);

        return result;
      }

      return value;
    }).call({'': root}, '', root);
  }

  function compareOwnPropertyKeys(a, b) {
    // Convert `a` and `b` to 32-bit integer values by first making them
    // numeric (`parseInt(...)`) and then coercing the result to 32-bits
    // (... | 0).
    var aInt32 = parseInt(a, 10) | 0;
    var bInt32 = parseInt(b, 10) | 0;

    // If coercing the 32-bit integer to a string results in exactly the
    // same value as the orginal key, then it is a 32-bit integer key.
    var aIsInt32Key = '' + aInt32 === a;
    var bIsInt32Key = '' + bInt32 === b;

    if (aIsInt32Key) {
      if (bIsInt32Key) {
        return a - b;
      } else {
        return -1;
      }
    } else if (bIsInt32Key) {
      // Order 32-bit integer keys (`b`) before any other keys (`a`).
      return 1;
    }

    // Accept non-ASCII characters in string keys.
    return a.localeCompare(b);
  }

  function isOwnPropertyKeyStore(value) {
    return value
      && typeof value === 'object'
      && !(value instanceof Boolean)
      && !(value instanceof Date)
      && !(value instanceof Number)
      && !(value instanceof RegExp)
      && !(value instanceof String);
  }

  return sortKeys;
}

// -----------------------------------------------------------------------------
var o = 'object';
_root = typeof global === o ? global : typeof window === o ? window : _root;
if (typeof define === 'function' && define.amd) {
  define(factory());
} else if (typeof module === o && module.exports) {
  module.exports = factory();
} else {
  _root.sortKeys = factory();
}
}(this));
