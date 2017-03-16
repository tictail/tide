import actionLogger from './actionLogger'
import stateLogger from './stateLogger'

export default function enableLogging(tide, {actions, state}) {
  if (actions) {
    actionLogger(tide)
  }
  if (state) {
    tide.addMiddleware(stateLogger)
  }
}
