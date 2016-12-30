/* eslint-disable no-console */
import Sinon from 'sinon'
import Immutable from 'immutable'

import Tide from 'base'
import Actions from 'actions'

let tideInstance

describe('Tide', () => {
  beforeEach(() => {
    tideInstance = new Tide()
  })

  describe('#enableLogging', () => {
    it('logs action calls when `actions` is true', () => {
      const sandbox = Sinon.sandbox.create()
      sandbox.stub(console, 'log')
      const spy = Sinon.spy()
      class FooActions extends Actions {
        static initClass() {
          this.prototype.bar = spy
        }
      }
      FooActions.initClass()

      tideInstance.addActions('foo', FooActions)
      tideInstance.enableLogging({actions: true})

      tideInstance.getActions('foo').bar('hello', 'world')
      console.log.should.have.been.calledWith(
        '%cAction performed', 'font-weight: bold;', 'foo.bar', 'hello', 'world'
      )
      spy.should.have.been.calledWith('hello', 'world')
      return sandbox.restore()
    })

    it('doesn\'t automatically bind the instance to action methods', () => {
      const spy = Sinon.spy()

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

      tideInstance.addActions('foo', FooActions)
      tideInstance.enableLogging({actions: true})

      tideInstance.getActions('foo').barCaller()
      return spy.should.not.have.been.calledOn(tideInstance.getActions('foo'))
    })

    it('still returns values from wrapped actions', () => {
      class FooActions extends Actions {
        bar() { return 'baz' }
      }

      tideInstance.addActions('foo', FooActions)
      tideInstance.enableLogging({actions: true})

      tideInstance.getActions('foo').bar().should.equal('baz')
    })

    return it('logs state updates when `state` is true', () => {
      const sandbox = Sinon.sandbox.create()
      sandbox.stub(console, 'group')
      sandbox.stub(console, 'log')
      sandbox.stub(console, 'groupEnd')

      tideInstance.setState(Immutable.Map({foo: 'baz'}))
      tideInstance.enableLogging({state: true})
      tideInstance.setState(Immutable.Map({foo: 'bar'}))

      console.group.should.have.been.calledWith('%cState mutation', 'font-weight: bold;')
      console.log.should.have.been.calledWith(
        '%cCurrent state', 'color: gray; font-weight: bold; %O', {foo: 'baz'}
      )
      console.log.should.have.been.calledWith(
        '%cOperation', 'font-weight: bold;', 'replace', '/foo', 'bar'
      )
      console.log.should.have.been.calledWith(
        '%cNext state', 'color: green; font-weight: bold; %O', {foo: 'bar'}
      )
      console.groupEnd.should.have.been.calledWith()

      return sandbox.restore()
    })
  })

  describe('#getActions', () => {
    it('gets a specific actions instance when given a name', () => {
      tideInstance.addActions('foo', Object)
      tideInstance.getActions('foo').should.exist
    })

    return it('returns all actions when name is left empty', () => {
      tideInstance.addActions('foo', Object)
      tideInstance.addActions('bar', Object)
      tideInstance.getActions().should.have.keys(['foo', 'bar'])
    })
  })

  describe('#setState', () => {
    it('updates the state returned by getState', () => {
      const state = {foo: 'bar'}
      tideInstance.setState(state)
      tideInstance.getState().should.equal(state)
    })

    it('emits a change event asynchronously', (done) => {
      let isAsync = false
      tideInstance.onChange(() => {
        isAsync.should.be.true
        done()
      })

      tideInstance.setState('foobar')
      isAsync = true
    })

    return it('emits a change event synchronously when given {immediate: true}', (done) => {
      let isAsync = false
      tideInstance.onChange(() => {
        isAsync.should.be.false
        done()
      })

      tideInstance.setState('foobar', {immediate: true})
      isAsync = true
    })
  })

  describe('#updateState', () => {
    it('calls the given updater with the state as the first argument', () => {
      tideInstance.setState({foo: 'bar'})
      const updater = Sinon.stub().returns(tideInstance.getState())
      tideInstance.updateState(updater)
      updater.should.have.been.calledWith(tideInstance.getState())
    })

    it('sets the state from the return value of the updater', () => {
      tideInstance.updateState(() => 'foobar')
      tideInstance.getState().should.equal('foobar')
    })

    return it('calls setState with the given options', () => {
      const options = {foo: 'bar'}
      Sinon.spy(tideInstance, 'setState')
      tideInstance.updateState(() => 'foobar', options)
      tideInstance.setState.should.have.been.calledWith('foobar', options)
      tideInstance.setState.restore()
    })
  })

  describe('#addActions', () => {
    it('instantiates the given class with the tide instance as the first argument', () => {
      const spy = Sinon.spy(() => { console.log('cal1') })
      class DummyClass {
        constructor() {
          spy(...arguments)
        }
      }
      tideInstance.addActions('dummy', DummyClass)
      spy.should.have.been.calledWith(tideInstance)
    })
  })

  describe('#mutate', () => {
    beforeEach(() => {
      tideInstance.setState(Immutable.fromJS({foo: {bar: 'baz'
    }}))
    })

    it('mutates the given path to the supplied value', () => {
      tideInstance.mutate(['foo', 'bar'], 'xyz')
      tideInstance.getState().getIn(['foo', 'bar']).should.equal('xyz')
    })

    it('mutates the given stringified path to the supplied value', () => {
      tideInstance.mutate('foo.bar', 'xyz')
      tideInstance.getState().getIn(['foo', 'bar']).should.equal('xyz')
    })

    it('mutates the given path with the result of the mutator', () => {
      tideInstance.mutate(['foo', 'bar'], existing => existing.toUpperCase())
      tideInstance.getState().getIn(['foo', 'bar']).should.equal('BAZ')
    })

    return it('calls setState with the given options', () => {
      const options = {foo: 'bar'}
      Sinon.spy(tideInstance, 'setState')
      tideInstance.mutate(['foo', 'bar'], 'xyz', options)
      tideInstance.setState.should.have.been.calledWith(Sinon.match.any, options)
      tideInstance.setState.restore()
    })
  })

  describe('#get', () => {
    it('allows you to get a value in state', () => {
      tideInstance.setState(Immutable.fromJS({foo: 'bar'}))
      tideInstance.get('foo').should.equal('bar')
    })

    it('allows you to get a path in state', () => {
      tideInstance.setState(Immutable.fromJS({foo: {bar: 'baz'
    }}))
      tideInstance.get(['foo', 'bar']).should.equal('baz')
    })

    return it('allows you to get a nested value in state via dot notation', () => {
      tideInstance.setState(Immutable.fromJS({foo: {bar: 'baz'
    }}))
      tideInstance.get('foo.bar').should.equal('baz')
    })
  })

  describe('#onChange', () =>
    it('registers a listener to the change event', (done) => {
      const callback = Sinon.spy()
      tideInstance.onChange(callback);
      (callback.callCount).should.equal(0)
      tideInstance.emitChange()
      return setTimeout(() => {
        (callback.callCount).should.equal(1)
        done()
      }, 0)
    })
  )

  return describe('#offChange', () =>
    it('unregisters the given listener from the change event', (done) => {
      const callback = Sinon.spy()
      tideInstance.onChange(callback)
      tideInstance.offChange(callback)
      setTimeout(() => {
        callback.callCount.should.equal(0)
        done()
      }, 0)
    })
  )
})
