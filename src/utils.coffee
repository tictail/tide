_ = require "underscore"
Immutable = require "immutable"

class Utils
  builtInClassMethods: Object.getOwnPropertyNames (class Noop).prototype

  getInternalMethods: (cls) ->
    methods = {}
    for name in Object.getOwnPropertyNames(cls.prototype)
      method = cls.prototype[name]
      continue unless @builtInClassMethods.indexOf(name) is -1
      continue unless _.isFunction method
      methods[name] = method

    methods

  isPromise: (value) ->
    value and
    (typeof value in ["object", "function"]) and
    (typeof value.then is "function")

  isCursor: (value) ->
    value and
    (typeof value is "object") and
    (typeof value.cursor is "function")

  isImmutable: (value) ->
    Immutable.Iterable.isIterable value

  hasBlobURLSupport: ->
    window and
    "URL" of window and
    "revokeObjectURL" of window.URL and
    "createObjectURL" of window.URL

module.exports = new Utils