import React, {Component} from 'react'
import {Router} from 'react-router'
import {Route, Switch} from 'react-router-dom'
import history from './history'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import "./fonts/PixelCowboy.otf"

import {Lobby} from './components/'

const muiTheme = getMuiTheme({
  palette: {
    textColor: '#B2391E',
  },
  fontFamily: 'PixelCowboy',
  appBar: {
    height: 50,
  },
});

/**
 * COMPONENT
 */
export default class Routes extends Component {

  render () {

    return (
      <Router history={history}>
          <Switch>
          <MuiThemeProvider muiTheme={muiTheme}>
            <Route path="/" component={Lobby} />
          </MuiThemeProvider>
          </Switch>
      </Router>
    )
  }
}