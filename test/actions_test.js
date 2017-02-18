import {Tide} from 'base'

let tideInstance

describe('Actions', () => {
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
})

describe('component', () => {
  it('passes down actions in the `tide` prop', function() {
    tideInstance.addActions('foo', Object)
    const actions = tideInstance.getActions('foo')

    const Child = createComponent(function() {
      expect(this.props.tide.actions.foo).toEqual(actions)
    })

    const tree = React.createElement(TideComponent, {tide: tideInstance}, Child)
    TestUtils.renderIntoDocument(tree)
  })

})
