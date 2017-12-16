const GET_KEYS = 'GET_KEYS'


export const getKeysAction = payload => ({
  type: GET_KEYS, payload
})

const initialState = {fire: 32, smash: 90, pickup: 88, lockOn: 67}


export default function (state = initialState, action) {
  switch (action.type) {
    case GET_KEYS:
      return action.payload
    default:
      return state
  }
}
