/* global describe beforeEach afterEach it */
import gameReducer, {actionTypesForTesting} from './game'

describe('Game', () => {

  const initialState = {localGame: false, serverGame: false, joined: false, lobbyFull: false}
  const gameInProgressJoinedState = { localGame: false, serverGame: true, joined: true, lobbyFull: false }
  const localGameState = { localGame: true, serverGame: true, joined: true, lobbyFull: false }
  const joinedState = { localGame: false, serverGame: false, joined: true, lobbyFull: false }
  const lobbyFullState = { localGame: false, serverGame: false, joined: false, lobbyFull: true }
  const gameInProgressState = { localGame: false, serverGame: true, joined: false, lobbyFull: false }

  describe('Game reducer', () => {
    it('should return the initial state', () => {
      expect(gameReducer(undefined, initialState)).toEqual(initialState)
    })

      it('should return true if a player has joined', () => {
        expect(gameReducer(initialState, {type: actionTypesForTesting.JOINED_GAME})).toEqual(joinedState)
      })


      it('should return true if a player has tried to join a full lobby', () => {
        expect(gameReducer(initialState, {type: actionTypesForTesting.LOBBY_FULL})).toEqual(lobbyFullState)
      })

    it('should return false if a player has left the lobby', () => {
      expect(gameReducer(joinedState, {type: actionTypesForTesting.LEFT_GAME})).toEqual(initialState)
    })

    it('should return serverGame true if a game is in progress', () => {
      expect(gameReducer(initialState, {type: actionTypesForTesting.GAME_IN_PROGRESS})).toEqual(gameInProgressState)
    })

    it('should return serverGame true if a game is in progress', () => {
      expect(gameReducer(gameInProgressJoinedState, { type: actionTypesForTesting.START_GAME })).toEqual(localGameState)
    })

    it('should reset game state if the game is over', () => {
      expect(gameReducer(localGameState, {type: actionTypesForTesting.GAME_OVER})).toEqual(initialState)
    })
  })
})
