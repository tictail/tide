import Immutable from 'immutable'
import {Actions} from 'tictail-tide'
import uuid from 'node-uuid'

const STORAGE_KEY = 'todos-tide'
// Actions are a set of methods that handle updates
// to the global state in response to user interaction. You should
// also do tracking and other non state modifying things here
// to reduce the logic written in your views as much as possible.
class TodoActions extends Actions {
  load() {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const todos = items.reduce((acc, item) => (
      acc.set(item.id, Immutable.fromJS(item))
    ), Immutable.OrderedMap())
    this.mutate('todos', todos)
  }

  setFilter(filter) {
    this.mutate('filter', filter)
  }

  setTodoInputText(text) {
    // `this.mutate` mutates a value in the state at the given path.
    // This will trigger a re-render in the components that are listening
    // to this value.
    this.mutate('todoInputText', text)
  }

  addTodo() {
    const title = this.get('todoInputText')
    if (title) {
      const item = Immutable.fromJS({
        id: uuid.v4(),
        completed: false,
        title: title.trim(),
      })

      // If we are planning to make multiple state changes,
      // it's better to use `this.updateState` so that we don't
      // emit more than one change event.
      this.updateState((state) => (
        state
          .set('todos', state.get('todos').set(item.get('id'), item))
          .set('todoInputText', '')
      ))
      this.storeTodos()
    }
  }

  toggleCompleted(todoKeyPath) {
    this.mutate(todoKeyPath.concat(['completed']), (value) => !value)
    this.storeTodos()
  }

  toggleAllCompleted() {
    const allCompleted = this.get('todos').every((todo) => todo.get('completed'))
    this.mutate(['todos'], (todos) => (
      todos.map((todo) => todo.set('completed', !allCompleted))
    ))
    this.storeTodos()
  }

  clearCompleted() {
    this.mutate(['todos'], (todos) => (
      todos.filter((todo) => !todo.get('completed'))
    ))
    this.storeTodos()
  }

  changeTitle(todoKeyPath, value) {
    this.mutate(todoKeyPath.concat(['title']), value)
    this.storeTodos()
  }

  destroy(todoKeyPath) {
    const index = [...todoKeyPath].pop()
    this.mutate(['todos'], (todos) => todos.delete(index))
    this.storeTodos()
  }

  storeTodos() {
    const jsonTodos = JSON.stringify(this.get('todos').toList().toJS())
    localStorage.setItem(STORAGE_KEY, jsonTodos)
  }
}

export default TodoActions
