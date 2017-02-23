import React from 'react'
import TestUtils from 'react-addons-test-utils'
import {Tide} from 'base'
import {TideComponent} from 'component'
import {Actions, init} from 'actions'

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
      init(tideInstance, {
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
      init(tideInstance, {foo: TestAction})
      expect(tideInstance.getActions('foo') instanceof TestAction).toBe(true)
    })

    it('returns all actions when name is left empty', () => {
      expect.assertions(1)
      init(tideInstance, {foo: TestAction, bar: TestAction})
      expect(Object.keys(tideInstance.getActions())).toEqual(['foo', 'bar'])
    })
  })

  describe('#getActions', () => {
    it('gets a specific actions instance when given a name', () => {
      expect.assertions(1)
      init(tideInstance, {foo: TestAction, bar: TestAction})
      expect(tideInstance.getActions('foo').getActions('bar') instanceof TestAction).toBe(true)
    })

    it('returns all actions when name is left empty', () => {
      expect.assertions(1)
      init(tideInstance, {foo: TestAction, bar: TestAction})
      expect(Object.keys(tideInstance.getActions('foo').getActions())).toEqual(['foo', 'bar'])
    })
  })

  describe('#component', () => {
    it('passes down actions in the `tide` prop', function() {
      expect.assertions(1)
      init(tideInstance, {foo: TestAction})

      TestUtils.renderIntoDocument(
        <TideComponent tide={tideInstance}>
          {({tide}) => {
            expect(tide.actions.foo instanceof TestAction).toBe(true)
            return null
          }}
        </TideComponent>
      )
    })
  })
})
