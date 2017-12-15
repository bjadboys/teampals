const GET_KEYS = 'GET_KEYS'


export const savedKeys = value => ({
    type: GET_KEYS, value
})


export default function (state = [], action) {
    switch (action.type) {
    case GET_KEYS:
        return action.value
    default:
        return state
    }
}
