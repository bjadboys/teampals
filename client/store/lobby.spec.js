import * as lobby from './lobby'

describe('actions', () => {
  it('addPlayers action should create an action to add players to lobby', () => {
    const players = [{playerID:1},{playerID:2}] 
    const expectedAction = {
      type: lobby.ADD_PLAYERS,
      payload: players
    }
    expect(lobby.addPlayersAction(players)).toEqual(expectedAction)
  })

  it('removePlayerAction should create an action to remove a player from lobby', () => {
    const playerID = 1
    const expectedAction = {
      type: lobby.REMOVE_PLAYER,
      payload: playerID
    }
    expect(lobby.removePlayerAction(playerID)).toEqual(expectedAction)
  })

  it('resetLobbyAction should create an action to remove all players from lobby', () => {
    const expectedAction = {
      type: lobby.RESET_LOBBY,
    }
    expect(lobby.resetLobbyAction()).toEqual(expectedAction)
  })

})

describe('Lobby reducer', () => {
  it('should return the initial state', () => {
    expect(lobby.default(undefined, {})).toEqual([])
  })

  it('should handle ADD_PLAYERS', () => {
    const players = [{id:1},{id:2}] 
    expect(
      lobby.default([], {
        type: lobby.ADD_PLAYERS,
        payload: players
      })
    ).toEqual([{id:1},{id:2}])
  })

  it('should handle REMOVE_PLAYER', () => {
    const playerID = 1
    expect(
      lobby.default([{id:1},{id:2}], {
        type: lobby.REMOVE_PLAYER,
        payload: playerID
      })
    ).toEqual([{id:2}])
  })

  it('should handle RESET_LOBBY', () => {
    expect(
      lobby.default([{id:1},{id:2}], {
        type: lobby.RESET_LOBBY,
      })
    ).toEqual([])
  })
})