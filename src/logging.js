import diff from 'immutablediff'

export default function(fn) {
  return function(...args) {
    logStateUpdate(...args)
    return fn(...args)
  }
}

/* eslint-disable no-console */
function logStateUpdate(currentState, nextState) {
  console.info(currentState, nextState, '------')
  if (console.group) console.group('%cState mutation', 'font-weight: bold;')

  console.log('%cCurrent state', 'color: gray; font-weight: bold; %O', currentState.toJS())
  const operations = diff(currentState, nextState)
  if (operations.size > 1) {
    console.log('%cOperations %O', 'font-weight: bold;', diff(currentState, nextState).toJS())
  } else if (operations.size === 1) {
    const operation = operations.first().toJS()
    console.log(
      '%cOperation',
      'font-weight: bold;',
      operation.op, operation.path, operation.value
    )
  } else {
    console.log('%cOperation', 'font-weight: bold;', 'Noop')
  }
  console.log('%cNext state', 'color: green; font-weight: bold; %O',
              nextState ? nextState.toJS() : '')

  if (console.groupEnd) console.groupEnd()
}
