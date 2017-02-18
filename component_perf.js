/* eslint-disable react/no-multi-comp */
import React from 'react'
import ReactDOM from 'react-dom/server'
import Immutable from 'immutable'

import {Tide} from './src/base'
import {TideComponent, AltTideComponent} from './src/component'

const tideInstance = new Tide()

const state = Immutable.fromJS({nested: {foo: 'foo'}})
tideInstance.setState(state)
const start2 = new Date()
for (let i = 0; i < 500000; i += 1) {
  const tree1 = (
    <AltTideComponent tide={tideInstance} foo={'bar'}>
      <span>{'foo'}</span>
    </AltTideComponent>
  )
  ReactDOM.renderToString(tree1)
}
console.log('alt', new Date() - start2)
// const start = new Date()
// for (let i = 0; i < 500000; i += 1) {
//   const tree1 = (
//     <TideComponent tide={tideInstance} foo={'bar'}>
//       {(props) => (<span>{'foo'}</span>)}
//     </TideComponent>
//   )
//   ReactDOM.renderToString(tree1)
// }
// console.log('func', new Date() - start)
