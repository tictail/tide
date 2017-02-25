/* eslint-disable no-console */
import Immutable from 'immutable'
import {Tide} from 'base'
import {Actions, init} from 'actions'
import enableLogging from 'actionLogger'

let tideInstance

describe('ActionLogger', () => {
  beforeEach(() => {
    tideInstance = new Tide()
    tideInstance.setState(Immutable.Map({foo: 'baz'}))
  })

  it('logs action calls', () => {
    const logStub = jest.fn()
    console.log = logStub
    const spy = jest.fn()
    class FooActions extends Actions {
      static initClass() {
        this.prototype.bar = spy
      }
    }
    FooActions.initClass()

    init(tideInstance, {foo: FooActions})
    enableLogging(tideInstance)

    tideInstance.getActions('foo').bar('hello', 'world')
    expect(logStub).toHaveBeenCalledWith(
      '%cAction performed', 'font-weight: bold;', 'foo.bar', 'hello', 'world'
    )
    expect(spy).toHaveBeenCalledWith('hello', 'world')
  })

  it('doesn\'t automatically bind the instance to action methods', () => {
    expect.assertions(2)
    const spy = jest.fn(function() {
      expect(this.name).toBe('nodejs')
      expect(this.name).not.toBe('FooActions')
    })

    class FooActions extends Actions {
      static initClass() {
        this.prototype.bar = spy
      }
      barCaller() {
        const {bar} = this
        return bar()
      }
    }
    FooActions.initClass()
    init(tideInstance, {foo: FooActions})
    enableLogging(tideInstance)
    tideInstance.getActions('foo').barCaller()
  })

  it('still returns values from wrapped actions', () => {
    class FooActions extends Actions {
      bar() { return 'baz' }
    }
    init(tideInstance, {foo: FooActions})
    enableLogging(tideInstance)
    expect(tideInstance.getActions('foo').bar()).toEqual('baz')
  })
})
