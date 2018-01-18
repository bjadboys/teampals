/**
 * ACTION TYPES
 */
export const CHANGE_NAME = 'CHANGE_NAME'
export const CHANGE_SPRITE = 'CHANGE_SPRITE'

/**
 * ACTION CREATORS
 */
export const changeNameAction = payload => ({type: CHANGE_NAME, payload})
export const changeSpriteAction = payload => ({type: CHANGE_SPRITE, payload})

/**
 * REDUCER
 */
export default function (state = { name: "", sprite: 0 }, action) {
    switch (action.type) {
        case CHANGE_NAME:
            
            return Object.assign({}, state, {name: action.payload})
        case CHANGE_SPRITE:
            return Object.assign({}, state, {sprite: action.payload})
        default:
            return state
    }
}
