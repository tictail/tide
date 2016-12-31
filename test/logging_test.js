/* eslint-disable no-console */
import Immutable from 'immutable'
import Tide from 'base'
import Actions from 'actions'
import logging from 'logging'

let tideInstance

describe('Tide', () => {
  beforeEach(() => {
    tideInstance = new Tide()
    tideInstance.setState(Immutable.Map({foo: 'baz'}))
    tideInstance.addMiddleware(logging)
  })

  describe('#enableLogging', () => {
    // it('logs action calls when `actions` is true', () => {
    //   const logStub = jest.fn()
    //   console.log = logStub
    //   const spy = jest.fn()
    //   class FooActions extends Actions {
    //     static initClass() {
    //       this.prototype.bar = spy
    //     }
    //   }
    //   FooActions.initClass()
    //
    //   tideInstance.addActions('foo', FooActions)
    //   tideInstance.enableLogging({actions: true})
    //
    //   tideInstance.getActions('foo').bar('hello', 'world')
    //   expect(logStub).toHaveBeenCalledWith(
    //     '%cAction performed', 'font-weight: bold;', 'foo.bar', 'hello', 'world'
    //   )
    //   expect(spy).toHaveBeenCalledWith('hello', 'world')
    // })
    //
    // it('doesn\'t automatically bind the instance to action methods', () => {
    //   const spy = jest.fn(function() {
    //     expect(this.name).toBe('nodejs')
    //     expect(this.name).not.toBe('FooActions')
    //   })
    //
    //   class FooActions extends Actions {
    //     static initClass() {
    //       this.prototype.bar = spy
    //     }
    //     barCaller() {
    //       const {bar} = this
    //       return bar()
    //     }
    //   }
    //   FooActions.initClass()
    //   tideInstance.addActions('foo', FooActions)
    //   tideInstance.enableLogging({actions: true})
    //   tideInstance.getActions('foo').barCaller()
    // })
    //
    // it('still returns values from wrapped actions', () => {
    //   class FooActions extends Actions {
    //     bar() { return 'baz' }
    //   }
    //
    //   tideInstance.addActions('foo', FooActions)
    //   tideInstance.enableLogging({actions: true})
    //
    //   expect(tideInstance.getActions('foo').bar()).toEqual('baz')
    // })

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
})
