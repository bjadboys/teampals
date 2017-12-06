/* global describe beforeEach afterEach it */

import {expect} from 'chai'
import configureMockStore from 'redux-mock-store'
import thunkMiddleware from 'redux-thunk'
import history from '../history'

const middlewares = [thunkMiddleware]
const mockStore = configureMockStore(middlewares)

describe('thunk creators', () => {
  
  describe('Game store', () => {
    xit('marks a player as joined when they join a game', () => {
      const fakeUser = {email: 'Cody'}
      return store.dispatch()
        .then(() => {
          const actions = store.getActions()
          expect(actions[0].type).to.be.equal('GET_USER')
          expect(actions[0].user).to.be.deep.equal(fakeUser)
        })
    })
  })

  describe('logout', () => {
    xit('logout: eventually dispatches the REMOVE_USER action', () => {
      mockAxios.onPost('/auth/logout').replyOnce(204)
      return store.dispatch(logout())
        .then(() => {
          const actions = store.getActions()
          expect(actions[0].type).to.be.equal('REMOVE_USER')
          expect(history.location.pathname).to.be.equal('/login')
        })
    })
  })
})
