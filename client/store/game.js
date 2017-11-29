const START_GAME = 'START_GAME'

/**
 * INITIAL STATE
 */

/**
 * ACTION CREATORS
 */
export const startGameAction = payload => ({ type: START_GAME, payload })

/**
 * THUNK CREATORS
 */

/**
 * REDUCER
 */
export default function (state = false, action) {
  switch (action.type) {
    case START_GAME:
      return action.payload
    default:
      return state
  }
}