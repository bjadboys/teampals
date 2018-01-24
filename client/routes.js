import React from 'react'
import {Router} from 'react-router'
import {Route, Switch} from 'react-router-dom'
import history from './history'

import {Home} from './components/'

/**
 * COMPONENT
 */
export default function Routes() {
    return (
      <Router history={history}>
          <Switch>
            <Route path="/" component={Home} />
          </Switch>
      </Router>
    )
}
