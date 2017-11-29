import {cloneDeep} from 'lodash'

/**
 * ACTION TYPES
 */
const ADD_PLAYERS = 'ADD_PLAYERS'
const REMOVE_PLAYER = 'REMOVE_PLAYER'

/**
 * INITIAL STATE
 */

/**
 * ACTION CREATORS
 */
export const addPlayersAction = payload => ({type: ADD_PLAYERS, payload})
export const removePlayerAction = payload => ({type: REMOVE_PLAYER, payload})

/**
 * THUNK CREATORS
 */

/**
 * REDUCER
 */
export default function (state = [], action) {
  const newState = cloneDeep(state)
  switch (action.type) {
    case ADD_PLAYERS:
      return action.payload
    case REMOVE_PLAYER:
      return newState.filter(player => player.id !== action.payload)
    default:
      return state
  }
}
