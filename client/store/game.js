const START_GAME = 'START_GAME'
const GAME_IN_PROGRESS = 'GAME_IN_PROGRESS'
const JOINED_GAME = 'JOINED_GAME'
const LEFT_GAME = 'LEFT_GAME'
const GAME_OVER = 'GAME_OVER'
const GAME_HAS_ENDED = 'GAME_HAS_ENDED'

export const actionTypesForTesting = {START_GAME, GAME_IN_PROGRESS, JOINED_GAME, LEFT_GAME, GAME_OVER, GAME_HAS_ENDED}
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
export const gameOverAction = () => ({type: GAME_OVER})
export const gameHasEndedAction = () => ({type: GAME_HAS_ENDED})
/**
 * THUNK CREATORS
 */
const initialState = {localGame: false, serverGame: false, joined: false }
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
    case GAME_HAS_ENDED:
      newState.serverGame = false
      return newState
    case START_GAME:
      newState.localGame = true
      return newState
    case GAME_OVER:
      newState.localGame = false
      newState.serverGame = false
      newState.joined = false
      return newState
    default:
      return state
  }
}
