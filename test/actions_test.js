import React from 'react'
import {fromJS} from 'immutable'
import TestUtils from 'react-addons-test-utils'
import Tide from 'base'
import TideComponent from 'component'
import Actions, {initActions} from 'actions'

let tideInstance

class TestActions extends Actions {}

describe('Actions', () => {
  beforeEach(() => {
    tideInstance = new Tide()
  })

  describe('#init', () => {
    it('initializes all actions', () => {
      expect.assertions(2)
      const spy = jest.fn()
      class One extends Actions {
        constructor() {
          super(...arguments)
          spy('one')
        }
      }

      class Two extends Actions {
        constructor() {
          super(...arguments)
          spy('two')
        }
      }
      initActions(tideInstance, {
        one: One,
        two: Two,
      })
      expect(spy).toHaveBeenCalledWith('one')
      expect(spy).toHaveBeenCalledWith('two')
    })
  })

  describe('#tide.getActions', () => {
    it('gets a specific actions instance when given a name', () => {
      expect.assertions(1)
      initActions(tideInstance, {foo: TestActions})
      expect(tideInstance.getActions('foo') instanceof TestActions).toBe(true)
    })

    it('returns all actions when name is left empty', () => {
      expect.assertions(1)
      initActions(tideInstance, {foo: TestActions, bar: TestActions})
      expect(Object.keys(tideInstance.getActions())).toEqual(['foo', 'bar'])
    })
  })

  describe('#getActions', () => {
    it('gets a specific actions instance when given a name', () => {
      expect.assertions(1)
      initActions(tideInstance, {foo: TestActions, bar: TestActions})
      expect(tideInstance.getActions('foo').getActions('bar') instanceof TestActions).toBe(true)
    })

    it('returns all actions when name is left empty', () => {
      expect.assertions(1)
      initActions(tideInstance, {foo: TestActions, bar: TestActions})
      expect(Object.keys(tideInstance.getActions('foo').getActions())).toEqual(['foo', 'bar'])
    })
  })

  describe('#proxy methods', () => {
    it('getState', () => {
      expect.assertions(1)
      initActions(tideInstance, {foo: class Foo extends Actions {
        test() {
          return this.getState().getIn(['foo', 'bar'])
        }
      }})
      tideInstance.setState(fromJS({foo: {bar: 'baz'}}))
      expect(tideInstance.actions.foo.test()).toBe('baz')
    })

    it('get', () => {
      expect.assertions(1)
      initActions(tideInstance, {foo: class Foo extends Actions {
        test() {
          return this.get('foo.bar')
        }
      }})
      tideInstance.setState(fromJS({foo: {bar: 'baz'}}))
      expect(tideInstance.actions.foo.test()).toBe('baz')
    })

    it('getState', () => {
      expect.assertions(1)
      initActions(tideInstance, {foo: class Foo extends Actions {
        test() {
          return this.getState()
        }
      }})
      tideInstance.setState(fromJS({foo: {bar: 'baz'}}))
      expect(tideInstance.actions.foo.test().toJS()).toEqual({foo: {bar: 'baz'}})
    })

    it('mutate', () => {
      expect.assertions(1)
      initActions(tideInstance, {foo: class Foo extends Actions {
        testSet(v) {
          return this.mutate('foo.bar', v)
        }
        testGet() {
          return this.get('foo.bar')
        }
      }})
      tideInstance.setState(fromJS({foo: {bar: 'baz'}}))
      tideInstance.actions.foo.testSet('hi')
      expect(tideInstance.actions.foo.testGet()).toBe('hi')
    })

    it('setState', () => {
      expect.assertions(1)
      initActions(tideInstance, {foo: class Foo extends Actions {
        testSet(v) {
          return this.setState(v)
        }
        testGet() {
          return this.get('foo')
        }
      }})
      tideInstance.setState(fromJS({foo: {bar: 'baz'}}))
      tideInstance.actions.foo.testSet(fromJS({foo: 'hi'}))
      expect(tideInstance.actions.foo.testGet()).toBe('hi')
    })

    it('updateState', () => {
      expect.assertions(1)
      initActions(tideInstance, {foo: class Foo extends Actions {
        testSet(v) {
          return this.updateState((s) => s.setIn(['foo'], v))
        }
        testGet() {
          return this.get('foo')
        }
      }})
      tideInstance.setState(fromJS({foo: {bar: 'baz'}}))
      tideInstance.actions.foo.testSet('hi')
      expect(tideInstance.actions.foo.testGet()).toBe('hi')
    })
  })

  describe('#component', () => {
    it('passes down actions in the `tide` prop', function() {
      expect.assertions(1)
      initActions(tideInstance, {foo: TestActions})
      TestUtils.renderIntoDocument(
        <TideComponent tide={tideInstance}>
          {({tide}) => {
            expect(tide.actions.foo).toBeInstanceOf(TestActions)
            return null
          }}
        </TideComponent>
      )
    })
  })
})
