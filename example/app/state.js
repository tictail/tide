import {Record, OrderedMap} from 'immutable'

// This is the global state with its default values, which in most cases will likely be
// an Immutable Record object. This should be instantiated in your Tide constructor.
export default Record({
  todos: OrderedMap(),
  todoInputText: '',
  filter: 'all',
})
