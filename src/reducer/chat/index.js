/**
 * Свертка блока хранилища данных чата
 */

import isNil from 'lodash/isNil'
import shortid from 'shortid'

import reducerService from './reducer-service'

const ADD_MESSAGE = 'webrtc-presentation-conference/chat/ADD_MESSAGE'
const EDIT_MESSAGE = 'webrtc-presentation-conference/chat/EDIT_MESSAGE'

const reducerMap = {
    [ADD_MESSAGE]: reducerService.addMessage,
    [EDIT_MESSAGE]: reducerService.editMessage,
}

export default function reducer (state = {}, action) {
    const handler = reducerMap[action.type]

    if (isNil(handler)) {

        return state
    }

    return handler(state, action)
}

//  фабрики действий
export function addMessage (text, user, date = (new Date()).toISOString() ) {

    return {
        id: shortid.generate(),
        type: ADD_MESSAGE,
        text,
        date,
        user,
    }
}

export function editMessage (message) {

    return {
        type: EDIT_MESSAGE,
        message,
    }
}

