import {Tide, initActions} from 'tide'
import State from 'app/state'
import TodoActions from 'app/actions/todo'

// This is where you instantiate your global store and
// register your actions

export default function create() {
  const tide = new Tide()
  tide.setState(new State())
  initActions(tide, {todo: TodoActions})
  return tide
}
