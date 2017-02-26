/* eslint-disable no-console */
import Immutable from 'immutable'
import Tide from 'base'
import stateLogger from 'stateLogger'

let tide

describe('stateLogger', () => {
  beforeEach(() => {
    tide = new Tide()
    tide.setState(Immutable.Map({foo: 'baz', bar: 'boo'}))
    tide.addMiddleware(stateLogger)
    console.group = jest.fn()
    console.log = jest.fn()
    console.groupEnd = jest.fn()
  })

  it('logs single state updates', () => {
    tide.setState(Immutable.Map({foo: 'bar', bar: 'boo'}))
    expect(console.group).toHaveBeenCalledWith('%cState mutation', 'font-weight: bold;')
    expect(console.log).toHaveBeenCalledWith(
      '%cCurrent state', 'color: gray; font-weight: bold; %O', {foo: 'baz', bar: 'boo'}
    )
    expect(console.log).toHaveBeenCalledWith(
      '%cOperation', 'font-weight: bold;', 'replace', '/foo', 'bar'
    )
    expect(console.log).toHaveBeenCalledWith(
      '%cNext state', 'color: green; font-weight: bold; %O', {foo: 'bar', bar: 'boo'}
    )
    expect(console.groupEnd).toHaveBeenCalledWith()
  })

  it('logs noop state update', () => {
    tide.setState(Immutable.Map({foo: 'baz', bar: 'boo'}))
    expect(console.group).toHaveBeenCalledWith('%cState mutation', 'font-weight: bold;')
    expect(console.log).toHaveBeenCalledWith(
      '%cCurrent state', 'color: gray; font-weight: bold; %O', {foo: 'baz', bar: 'boo'}
    )
    expect(console.log).toHaveBeenCalledWith(
      '%cOperation', 'font-weight: bold;', 'Noop'
    )
    expect(console.groupEnd).toHaveBeenCalledWith()
  })

  it('logs multiple state update', () => {
    tide.setState(Immutable.Map({foo: 'bar', bar: 'hi'}))
    expect(console.group).toHaveBeenCalledWith('%cState mutation', 'font-weight: bold;')
    expect(console.log).toHaveBeenCalledWith(
      '%cCurrent state', 'color: gray; font-weight: bold; %O', {'bar': 'boo', 'foo': 'baz'}
    )
    expect(console.log).toHaveBeenCalledWith(
      '%cOperations %O', 'font-weight: bold;', [{'op': 'replace', 'path': '/foo', 'value': 'bar'}, {'op': 'replace', 'path': '/bar', 'value': 'hi'}]
    )
    expect(console.log).toHaveBeenCalledWith(
      '%cNext state', 'color: green; font-weight: bold; %O', {'bar': 'hi', 'foo': 'bar'}
    )
    expect(console.groupEnd).toHaveBeenCalledWith()
  })
})
