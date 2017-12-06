import './index.scss'
import React from 'react'
import ReactDOM from 'react-dom'
import {Provider} from 'react-redux'
import store from './store'
import Routes from './routes'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme'

const muiTheme = getMuiTheme({
  palette: {
    textColor: '#B2391E',
  },
  fontFamily: 'Slackey',
  appBar: {
    height: 50,
  },
});


// establishes socket connection

ReactDOM.render(
  <Provider store={store}>
    <MuiThemeProvider muiTheme={muiTheme}>
    <Routes />
    </MuiThemeProvider>
  </Provider>,
  document.getElementById('app')
)
