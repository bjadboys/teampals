const START_GAME = 'START_GAME'
const GAME_IN_PROGRESS = 'GAME_IN_PROGRESS'
/**
 * INITIAL STATE
 */

/**
 * ACTION CREATORS
 */
export const startGameAction = () => ({ type: START_GAME })
export const gameInProgressAction = () => ({type: GAME_IN_PROGRESS})
/**
 * THUNK CREATORS
 */
const initialState = {localGame: false, serverGame: false}
/**
 * REDUCER
 */
export default function (state = initialState, action) {
  const newState = Object.assign({}, state)
  switch (action.type) {
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