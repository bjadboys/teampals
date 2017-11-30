const START_GAME = 'START_GAME'
const GAME_IN_PROGRESS = 'GAME_IN_PROGRESS'
const JOINED_GAME = 'JOINED_GAME'
const LEFT_GAME = 'LEFT_GAME'
/**
 * INITIAL STATE
 */

/**
 * ACTION CREATORS
 */
export const startGameAction = () => ({ type: START_GAME })
export const gameInProgressAction = () => ({type: GAME_IN_PROGRESS})
export const joinedGameAction = () => ({type: JOINED_GAME})
export const leftGameAction = () => ({type: LEFT_GAME})
/**
 * THUNK CREATORS
 */
const initialState = {localGame: false, serverGame: false, joined: false}
/**
 * REDUCER
 */
export default function (state = initialState, action) {
  const newState = Object.assign({}, state)
  switch (action.type) {
    case LEFT_GAME:
      newState.joined = false
      return newState
    case JOINED_GAME:
      newState.joined = true
      return newState
    case GAME_IN_PROGRESS:
      newState.serverGame = true
      return newState
    case START_GAME:
      newState.localGame = true
      return newState
    default:
      return state
  }
}