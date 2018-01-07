/**
 * Свертка блока хранилища данных пользователя
 */

import isNil from 'lodash/isNil'

import reducerService from './reducer-service'

const SET_USER_TYPE = 'webrtc-presentation-conference/user/SET_USER_TYPE'

const reducerMap = {
    [SET_USER_TYPE]: reducerService.setUserType
}

export default function reducer (state = { type: null }, action) {
    const handler = reducerMap[action.type]

    if (isNil(handler)) {

        return state
    }

    return handler(state, action)
}

//  фабрики действий
export function setUserType (type) {
    
    return {
        type: SET_USER_TYPE,
        userType: type
    }
}
