import React, {Component} from 'react'
import {Router} from 'react-router'
import {Route, Switch} from 'react-router-dom'
import history from './history'

import {Lobby} from './components/'

/**
 * COMPONENT
 */
export default class Routes extends Component {

  render () {

    return (
      <Router history={history}>
          <Switch>
            <Route path="/" component={Lobby} />
          </Switch>
      </Router>
    )
  }
}