import {Base} from 'tide'

import State from 'app/state'
import TodoActions from 'app/actions/todo'

// The Tide class is where you instantiate your global store and
// register your actions
class Tide extends Base {
  constructor() {
    super()
    this.setState(new State())
    this.addActions('todo', TodoActions)
  }
}

export default Tide
