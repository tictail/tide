import React from 'react'
import {fromJS} from 'immutable'
import TestUtils from 'react-addons-test-utils'
import Tide from 'base'
import TideComponent from 'component'
import Actions, {initActions} from 'actions'

let tideInstance

class TestAction extends Actions {}

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
      initActions(tideInstance, {foo: TestAction})
      expect(tideInstance.getActions('foo') instanceof TestAction).toBe(true)
    })

    it('returns all actions when name is left empty', () => {
      expect.assertions(1)
      initActions(tideInstance, {foo: TestAction, bar: TestAction})
      expect(Object.keys(tideInstance.getActions())).toEqual(['foo', 'bar'])
    })
  })

  describe('#getActions', () => {
    it('gets a specific actions instance when given a name', () => {
      expect.assertions(1)
      initActions(tideInstance, {foo: TestAction, bar: TestAction})
      expect(tideInstance.getActions('foo').getActions('bar') instanceof TestAction).toBe(true)
    })

    it('returns all actions when name is left empty', () => {
      expect.assertions(1)
      initActions(tideInstance, {foo: TestAction, bar: TestAction})
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
      initActions(tideInstance, {foo: TestAction})
      TestUtils.renderIntoDocument(
        <TideComponent tide={tideInstance}>
          {({tide}) => {
            expect(tide.actions.foo).toBeInstanceOf(TestAction)
            return null
          }}
        </TideComponent>
      )
    })
  })
})

class TestNamespacedActions extends Actions {
  constructor() {
    super(...arguments)
    this.namespace = ['disney']
  }
}

describe('Namespaced actions', () => {
  /* eslint-disable prefer-const */
  let tide, actions
  const defaultState = fromJS({
    disney: {
      characters: [
        'Mickey Mouse',
        'Donald Duck',
        'Goofy Goof'
      ]
    },
    marvel: {
      characters: [
        'Spider-Man',
        'Iron Man',
        'Wolverine'
      ]
    }
  })

  beforeEach(() => {
    tide = new Tide()
    actions = new TestNamespacedActions(tide)
    tide.setState(defaultState)
  })

  describe('#getState', () => {
    it('uses the namespace', () => {
      expect(actions.getState()).toEqual(defaultState.getIn(['disney']))
    })
  })

  describe('#setState', () => {
    it('uses the namespace', () => {
      const nextState = actions.getState().deleteIn(['characters', 0])
      actions.setState(nextState)
      expect(tide.getState().getIn(['disney', 'characters']).size).toEqual(2)
      expect(tide.getState().getIn(['marvel', 'characters']).size).toEqual(3)
    })
  })

  describe('#updateState', () => {
    it('uses the namespace', () => {
      const nextState = actions.getState().deleteIn(['characters', 0])
      actions.updateState(() => nextState)
      expect(tide.getState().getIn(['disney', 'characters']).size).toEqual(2)
      expect(tide.getState().getIn(['marvel', 'characters']).size).toEqual(3)
    })

    it('calls the updater with the namespaced state', () => {
      actions.updateState((state) => {
        expect(state).toEqual(tide.getState().getIn(['disney']))
      })
    })
  })

  describe('#mutate', () => {
    it('uses the namespace', () => {
      actions.mutate('characters.0', 'Minnie Mouse')
      expect(tide.getState().getIn(['disney', 'characters', '0'])).toEqual('Minnie Mouse')
    })

    it('calls the updater with the namespaced state when given a function', () => {
      actions.mutate('characters', (characters) => {
        expect(characters).toEqual(tide.getState().getIn(['disney', 'characters']))
        return characters.push('Pluto')
      })
      expect(tide.getState().getIn(['disney', 'characters']).size).toEqual(4)
    })
  })

  describe('#get', () => {
    it('uses the namespace', () => {
      expect(actions.get('characters.1')).toEqual('Donald Duck')
    })
  })

  describe('#getGlobalState', () => {
    it('returns the global state', () => {
      expect(actions.getGlobalState()).toEqual(tide.getState())
    })
  })

  describe('#setGlobalState', () => {
    it('sets the global state', () => {
      const nextState = tide.getState().deleteIn(['marvel', 'characters', 0])
      actions.setGlobalState(nextState)
      expect(tide.getState().getIn(['disney', 'characters']).size).toEqual(3)
      expect(tide.getState().getIn(['marvel', 'characters']).size).toEqual(2)
    })
  })

  describe('#updateGlobalState', () => {
    it('updates the global state', () => {
      actions.updateGlobalState((state) =>
        state.deleteIn(['marvel', 'characters', 0])
      )
      expect(tide.getState().getIn(['disney', 'characters']).size).toEqual(3)
      expect(tide.getState().getIn(['marvel', 'characters']).size).toEqual(2)
    })

    it('calls the updater with the global state', () => {
      actions.updateGlobalState((state) => {
        expect(state).toEqual(tide.getState())
      })
    })
  })

  describe('#mutateGlobal', () => {
    it('mutates the global state', () => {
      actions.mutateGlobal('marvel.characters.0', 'Hulk')
      expect(tide.getState().getIn(['marvel', 'characters', '0'])).toEqual('Hulk')
    })

    it('calls the updater with the correct state when given a function', () => {
      actions.mutateGlobal('marvel.characters', (characters) => {
        expect(characters).toEqual(tide.getState().getIn(['marvel', 'characters']))
        return characters.push('Hulk')
      })
      expect(tide.getState().getIn(['marvel', 'characters']).size).toEqual(4)
    })
  })

  describe('#getGlobal', () => {
    it('uses the global state', () => {
      expect(actions.getGlobal('marvel.characters.1')).toEqual('Iron Man')
    })
  })
})
