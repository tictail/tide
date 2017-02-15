import Utils from './utils'
import wrap from 'lodash.wrap'

export default function enableLogging(tide) {
  tide.actions.forEach(function(actions, actionsName) {
    const methods = Object.keys(Utils.getInternalMethods(actions.constructor))

    methods.forEach(function(method) {
      actions[method] = wrap(actions[method], function(func) {
        const callArgs = Array.prototype.slice.call(arguments, 1)
        logActionCall(actionsName, method, callArgs)
        return func.apply(this, callArgs)
      })
    })
  })
}

/* eslint-disable no-console */
function logActionCall(actionsName, methodName, args) {
  const logArgs = [
    '%cAction performed', 'font-weight: bold;', `${actionsName}.${methodName}`
  ].concat(args)
  console.log.apply(console, logArgs)
}
