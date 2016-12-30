import 'mocha'
import 'mocha/mocha.js'

import chai from 'chai'
import chaiChanges from 'chai-changes'
import chaiAsPromised from 'chai-as-promised'
import sinonChai from 'sinon-chai'

chai.should()
chai.use(chaiAsPromised)
chai.use(chaiChanges)
chai.use(sinonChai)

if (typeof initMochaPhantomJS === 'function') {
  initMochaPhantomJS()
}

mocha.setup('bdd')

require('./base_test')
require('./component_test')
require('./wrap_test')

mocha.run()
