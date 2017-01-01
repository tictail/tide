/* eslint-disable no-console */
import Immutable from 'immutable'
import Tide from 'base'
import enableLogging from 'stateLogger'

let tideInstance

describe('stateLogger', () => {
  beforeEach(() => {
    tideInstance = new Tide()
    tideInstance.setState(Immutable.Map({foo: 'baz'}))
    enableLogging(tideInstance)
  })

  it('logs state updates when `state` is true', () => {
    console.group = jest.fn()
    console.log = jest.fn()
    console.groupEnd = jest.fn()

    tideInstance.setState(Immutable.Map({foo: 'bar'}))

    expect(console.group).toHaveBeenCalledWith('%cState mutation', 'font-weight: bold;')
    expect(console.log).toHaveBeenCalledWith(
      '%cCurrent state', 'color: gray; font-weight: bold; %O', {foo: 'baz'}
    )
    expect(console.log).toHaveBeenCalledWith(
      '%cOperation', 'font-weight: bold;', 'replace', '/foo', 'bar'
    )
    expect(console.log).toHaveBeenCalledWith(
      '%cNext state', 'color: green; font-weight: bold; %O', {foo: 'bar'}
    )
    expect(console.groupEnd).toHaveBeenCalledWith()
  })
})
