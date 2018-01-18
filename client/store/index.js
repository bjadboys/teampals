import {createStore, combineReducers, applyMiddleware} from 'redux'
import createLogger from 'redux-logger'
import thunkMiddleware from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'
import lobby from './lobby'
import game from './game'
import keys from './keys'
import player from './player'

const reducer = combineReducers({lobby, game, keys, player})
const middleware = composeWithDevTools(applyMiddleware(
  thunkMiddleware,
  createLogger({collapsed: true})
))
const store = createStore(reducer, middleware)

export default store
export * from './lobby'
export * from './game'
export * from './keys'
export * from './player'
