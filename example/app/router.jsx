import React from 'react'
import ReactDOM from 'react-dom'
import {Route, Router, browserHistory} from 'react-router'
import {Component as TideComponent} from 'appkit-tide'

import Tide from 'app/tide'
import App from 'app/screens/app/index'
import Todo from 'app/screens/todo/index'

const loaders = {
  todo: ((tide) => {
    tide.getActions('todo').load()
    tide.getActions('todo').setFilter('all')
  }),

  todoActive: ((tide) => {
    tide.getActions('todo').load()
    tide.getActions('todo').setFilter('active')
  }),

  todoCompleted: ((tide) => {
    tide.getActions('todo').load()
    tide.getActions('todo').setFilter('completed')
  }),
}

export default {
  start: (() => {
    const tide = new Tide()

    // The ENVIRONMENT variable is set in the webpack config
    if (ENVIRONMENT === 'development') {
      // Log all action calls, state updates and component re-renders
      tide.enableLogging({actions: true, state: true, components: true})
    }

    const routes = (
      <Route component={App}>
        <Route path='/' component={Todo} onEnter={() => loaders.todo(tide)}/>
        <Route path='/active' component={Todo} onEnter={() => loaders.todoActive(tide)}/>
        <Route path='/completed' component={Todo} onEnter={() => loaders.todoCompleted(tide)}/>
      </Route>
    )

    const router = (
      <TideComponent impure tide={tide}>
        <Router history={browserHistory} routes={routes}/>
      </TideComponent>
    )

    ReactDOM.render(router, document.getElementById('app'))
  })
}
