/**
 * Свертка блока хранилища данных чата
 */

import isNil from 'lodash/isNil'
import shortid from 'shortid'

import reducerService from './reducer-service'

const ADD_MESSAGE = 'webrtc-presentation-conference/chat/ADD_MESSAGE'
const ADD_RECEIVE_MESSAGE = 'webrtc-presentation-conference/chat/ADD_RECEIVE_MESSAGE'
const EDIT_MESSAGE = 'webrtc-presentation-conference/chat/EDIT_MESSAGE'
const SET_MESSAGE_AS_SEND = 'webrtc-presentation-conference/chat/SET_MESSAGE_AS_SEND'

const reducerMap = {
    [ADD_MESSAGE]: reducerService.addMessage,
    [ADD_RECEIVE_MESSAGE]: reducerService.addMessage,
    [EDIT_MESSAGE]: reducerService.editMessage,
    [SET_MESSAGE_AS_SEND]: reducerService.setMessageAsSend,
}

export default function reducer (state = {}, action) {
    const handler = reducerMap[action.type]

    if (isNil(handler)) {

        return state
    }

    return handler(state, action)
}

//  фабрики действий
export function addMessage (text, user, date, id) {

    return {
        id: id || shortid.generate(),
        type: ADD_MESSAGE,
        text,
        date: date || (new Date()).toISOString(),
        user,
        isSend: false
    }
}

export function addReceiveMessage (id, text, user, date) {

    return {
        id,
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

export function setMessageAsSend (id) {

    return {
        type: SET_MESSAGE_AS_SEND,
        id,
    }
}

