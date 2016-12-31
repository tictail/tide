/* eslint-disable no-console */
import Immutable from 'immutable'
import Tide from 'base'

let tideInstance

describe('Tide', () => {
  beforeEach(() => {
    tideInstance = new Tide()
  })

  describe('#getActions', () => {
    it('gets a specific actions instance when given a name', () => {
      tideInstance.addActions('foo', Object)
      expect(tideInstance.getActions('foo')).toBeTruthy()
    })

    it('returns all actions when name is left empty', () => {
      tideInstance.addActions('foo', Object)
      tideInstance.addActions('bar', Object)
      expect(Object.keys(tideInstance.getActions())).toEqual(['foo', 'bar'])
    })
  })

  describe('#setState', () => {
    it('updates the state returned by getState', () => {
      const state = {foo: 'bar'}
      tideInstance.setState(state)
      expect(tideInstance.getState()).toEqual(state)
    })

    it('emits a change event asynchronously', (done) => {
      let isAsync = false
      tideInstance.onChange(() => {
        expect(isAsync).toBe(true)
        done()
      })

      tideInstance.setState('foobar')
      isAsync = true
    })

    it('emits a change event synchronously when given {immediate: true}', (done) => {
      let isAsync = false
      tideInstance.onChange(() => {
        expect(isAsync).toBe(false)
        done()
      })

      tideInstance.setState('foobar', {immediate: true})
      isAsync = true
    })
  })

  describe('#updateState', () => {
    it('calls the given updater with the state as the first argument', () => {
      tideInstance.setState({foo: 'bar'})
      const updater = jest.fn(() => tideInstance.getState())
      tideInstance.updateState(updater)
      expect(updater).toHaveBeenCalledWith(tideInstance.getState())
    })

    it('sets the state from the return value of the updater', () => {
      tideInstance.updateState(() => 'foobar')
      expect(tideInstance.getState()).toEqual('foobar')
    })

    it('calls setState with the given options', () => {
      const options = {foo: 'bar'}
      tideInstance.setState = jest.fn()
      tideInstance.updateState(() => 'foobar', options)
      expect(tideInstance.setState).toHaveBeenCalledWith('foobar', options)
    })
  })

  describe('#addActions', () => {
    it('instantiates the given class with the tide instance as the first argument', () => {
      const spy = jest.fn()
      class DummyClass {
        constructor() {
          spy(...arguments)
        }
      }
      tideInstance.addActions('dummy', DummyClass)
      expect(spy).toHaveBeenCalledWith(tideInstance)
    })
  })

  describe('#mutate', () => {
    beforeEach(() => {
      tideInstance.setState(Immutable.fromJS({foo: {bar: 'baz'}}))
    })

    it('mutates the given path to the supplied value', () => {
      tideInstance.mutate(['foo', 'bar'], 'xyz')
      expect(tideInstance.getState().getIn(['foo', 'bar'])).toEqual('xyz')
    })

    it('mutates the given stringified path to the supplied value', () => {
      tideInstance.mutate('foo.bar', 'xyz')
      expect(tideInstance.getState().getIn(['foo', 'bar'])).toEqual('xyz')
    })

    it('mutates the given path with the result of the mutator', () => {
      tideInstance.mutate(['foo', 'bar'], existing => existing.toUpperCase())
      expect(tideInstance.getState().getIn(['foo', 'bar'])).toEqual('BAZ')
    })

    it('calls setState with the given options', () => {
      const options = {foo: 'bar'}
      tideInstance.setState = jest.fn()
      tideInstance.mutate(['foo', 'bar'], 'xyz', options)
      expect(tideInstance.setState.mock.calls[0][1]).toEqual(options)
    })
  })

  describe('#get', () => {
    it('allows you to get a value in state', () => {
      tideInstance.setState(Immutable.fromJS({foo: 'bar'}))
      expect(tideInstance.get('foo')).toEqual('bar')
    })

    it('allows you to get a path in state', () => {
      tideInstance.setState(Immutable.fromJS({foo: {bar: 'baz'}}))
      expect(tideInstance.get(['foo', 'bar'])).toEqual('baz')
    })

    it('allows you to get a nested value in state via dot notation', () => {
      tideInstance.setState(Immutable.fromJS({foo: {bar: 'baz'}}))
      expect(tideInstance.get('foo.bar')).toEqual('baz')
    })
  })

  describe('#onChange', () =>
    it('registers a listener to the change event', (done) => {
      const callback = jest.fn()
      tideInstance.onChange(callback)
      expect(callback).toHaveBeenCalledTimes(0)
      tideInstance.emitChange()
      setTimeout(() => {
        expect(callback).toHaveBeenCalledTimes(1)
        done()
      }, 0)
    })
  )

  describe('#offChange', () =>
    it('unregisters the given listener from the change event', (done) => {
      const callback = jest.fn()
      tideInstance.onChange(callback)
      tideInstance.offChange(callback)
      setTimeout(() => {
        expect(callback).toHaveBeenCalledTimes(0)
        done()
      }, 0)
    })
  )
  describe('#middleware', () =>
    it('calls middleware on state change', () => {
      const insideMiddlewareSpy = jest.fn()
      const middlewareSpy = jest.fn((fn) => (...args) => {
        insideMiddlewareSpy()
        return fn(...args)
      })
      tideInstance.addMiddleware(middlewareSpy)
      expect(middlewareSpy).toHaveBeenCalledTimes(1)
      expect(insideMiddlewareSpy).toHaveBeenCalledTimes(0)
      tideInstance.setState(Immutable.fromJS({foo: 'bar'}))
      expect(tideInstance.get('foo')).toEqual('bar')
      expect(middlewareSpy).toHaveBeenCalledTimes(1)
      expect(insideMiddlewareSpy).toHaveBeenCalledTimes(1)
    })
  )
})
