/* eslint-disable no-console */
import Tide from 'base'
import enableLogging from 'logging'

jest.mock('../src/actionLogger', () => jest.fn())
jest.mock('../src/stateLogger', () => jest.fn())

let tideInstance

describe('ActionLogger', () => {
  beforeEach(() => {
    tideInstance = new Tide()
    tideInstance.addMiddleware = jest.fn()
    jest.resetAllMocks()
  })

  it('calls actionLogger', () => {
    enableLogging(tideInstance, {actions: true})
    expect(require('../src/actionLogger')).toHaveBeenCalled()
    expect(require('../src/stateLogger')).not.toHaveBeenCalled()
    expect(tideInstance.addMiddleware).not.toHaveBeenCalled()
  })

  it('calls stateLogger', () => {
    enableLogging(tideInstance, {state: true})
    expect(require('../src/actionLogger')).not.toHaveBeenCalled()
    expect(require('../src/stateLogger')).not.toHaveBeenCalled()
    expect(tideInstance.addMiddleware).toHaveBeenCalledWith(require('../src/stateLogger'))
  })
})
