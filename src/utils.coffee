class Utils
  builtInClassMethods: Object.getOwnPropertyNames (class Noop).prototype

  getInternalMethods: (cls) ->
    methods = {}
    for name in Object.getOwnPropertyNames(cls.prototype)
      method = cls.prototype[name]
      continue unless @builtInClassMethods.indexOf(name) is -1
      continue unless typeof(method) == 'function'
      methods[name] = method
    methods

module.exports = new Utils
