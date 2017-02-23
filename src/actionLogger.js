import {getInternalMethods} from './utils'
import wrap from 'lodash.wrap'

export default function enableLogging(tide) {
  const actions = tide.getActions()
  Object.keys(actions).forEach(function(key) {
    const actionsClass = actions[key]
    const methods = Object.keys(getInternalMethods(actionsClass.constructor))
    methods.forEach(function(method) {
      actionsClass[method] = wrap(actionsClass[method], function(func, ...callArgs) {
        logActionCall(key, method, callArgs)
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
