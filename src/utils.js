let builtInClassMethods = Object.getOwnPropertyNames((class Noop {}).prototype)

class Utils {
  getInternalMethods(cls) {
    let methods = {}
    Object.getOwnPropertyNames(cls.prototype).forEach((name) => {
      let method = cls.prototype[name]
      if (builtInClassMethods.indexOf(name) !== -1) return
      if (typeof(method) !== 'function') return
      methods[name] = method
    })
    return methods
  }
}

export default new Utils
