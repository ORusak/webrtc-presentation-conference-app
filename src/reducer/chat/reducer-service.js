/**
 * Сервис сверток данных чата
 */

import isNil from 'lodash/isNil'

const service = {
    addMessage(state, action) {
        const {
            id,
            user,
            text,
            date
        } = action

        if (isNil(id) || isNil(user) || isNil(text)) {

            return state
        }

        const newMessage = {
            id,
            text,
            user,
            date
        }
        
        return {
            ...state,
            messages: [...state.messages, newMessage]
        }
    },

    editMessage(state, action) {

        return {
            ...state,
            messageText: action.message
        }
    }
}

export default service
