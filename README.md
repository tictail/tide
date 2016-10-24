# ![tide](https://cloud.githubusercontent.com/assets/847651/18448327/b029ad60-78f8-11e6-9ca4-eff619c8a2c8.png)

[![NPM](https://img.shields.io/npm/v/tide.svg)](https://www.npmjs.com/package/tide) [![CircleCI](https://circleci.com/gh/tictail/tide.svg?style=shield&circle-token=7cb8ffee9ae3acc8e92c68c8beff08ab66283112)](https://circleci.com/gh/tictail/tide)

## Intro

Tide is a simple state management library for your React project. It adopts the unidirectional state flow approach prescribed by Flux, but removes the dispatcher entirely and the contract that comes with it. The central state is an [Immutable](https://github.com/facebook/immutable-js) object updated by actions that have write access to the state object and are exposed directly to the React views. In turn, Tide lets every single React components specify which paths of the state they care about, and automatically re-renders them whenever that data changes.

We've been using Tide in production at [Tictail](https://tictail.com) since 2015. Want to learn more? Check out the [original blog post](http://tic.tl/introducing-tide).

## Installation

Tide is hosted on NPM. To install it and add it to your `package.json` in one fell swoop, just run:

```
npm install --save tide
```

## Example

Let’s dive into a typical Tide application structure with the global state object, an action class and a component. The snippets below are from our [TodoMVC example app]( https://github.com/tictail/tide/tree/master/example/app).

Here’s the application’s state object:

```JavaScript
import {Record, OrderedMap} from 'immutable'

export default Record({
  todos: OrderedMap(),
  todoInputText: '',
  filter: 'all',
})
```

The application state is just a simple, logic-less container of data using an immutable structure. This contains all of the data that will potentially change during the lifetime of the app, even the smaller things like the value of the todo input field. Tide allows us to update this value on every keypress without having to worry about performance. In a traditional Flux structure, you normally wouldn’t do that since that would trigger a lot of unnecessary re-renders (unless you make sure to add `shouldComponentUpdate` handlers everywhere).

To explain the benefits of keeping this value in our global state, let’s take a look at a trimmed down version of the actions in our todo app:

```JavaScript
import Immutable from 'immutable'
import {Actions} from 'tide'
import uuid from 'node-uuid'

class TodoActions extends Actions {
  setTodoInputText(text) {
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

      this.mutate(['todos', item.get('id')], item)
      this.mutate('todoInputText', '')
    }
  }
}

export default TodoActions
```

The actions class has direct access to read and update (`mutate`) the state. Other than that they are just collections of methods performing business logic for your app.

In the snippet above you’ll see that the `addTodo` action is free of parameters – it can retrieve everything it needs from the global state. The convenience of this becomes apparent when we imagine a more complex case with a user account form with different input fields for name, email, country, profile picture etc. Once we click the save button we don’t have to try to gather everything together in the views since the save action already has the all the data that it needs.

Another benefit is that the logic of clearing the input after adding the todo item can also be done on the action layer instead of in the view, a further step towards keeping all business logic in one place.

The final code snippet to tie this example together is our input field component:

```JavaScript
import React from 'react'
import {wrap} from 'tide'

const TodoInput = React.createClass({
  onChange(e) {
    this.props.tide.actions.todo.setTodoInputText(e.target.value)
  },

  onKeyPress(e) {
    if (e.key === 'Enter') {
      this.props.tide.actions.todo.addTodo()
    }
  },

  render() {
    return (
      <input
        className='new-todo'
        value={this.props.value}
        onChange={this.onChange}
        onKeyPress={this.onKeyPress}
        placeholder={'What needs to be done?'}
        autoFocus
      />
    )
  }
})

export default wrap(TodoInput, {value: 'todoInputText'})
```

At the bottom of the component code you’ll see us use the wrap function provided in Tide. This connects us to the global state, which in this case binds the value prop to the `todoInputText` key in the state. We also get access to all of our actions inside the tide namespace in our props. Other than that it’s pretty straight forward – we call our `setTodoInputText` action when the input changes, which updates the global state, which in turn triggers a re-render of the component. When the user presses the enter key we just call the `addTodo` action which takes care of the rest.

## Documentation

Head on over to [the wiki](https://github.com/tictail/tide/wiki) for the full documentation.

## Contributing

For bugs and feature requests, please open an issue. If you'd like to contribute, create a new PR
with your changes. Make sure you include tests, bump the version in `package.json` according to
[semantic versioning](http://semver.org/) and update the [CHANGELOG](changelog.md) (if applicable).

## License

MIT
