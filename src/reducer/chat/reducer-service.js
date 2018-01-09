/**
 * Сервис сверток данных чата
 */

import isNil from 'lodash/isNil'
import map from 'lodash/map'

const service = {
    addMessage(state, action) {
        const {
            id,
            user,
            text,
            date,
            isSend
        } = action

        if (isNil(id) || isNil(user) || isNil(text)) {

            return state
        }

        const newMessage = {
            id,
            text,
            user,
            date,
            isSend
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
    },
    
    setMessageAsSend(state, action) {
        const {messages} = state
        //  отправленного сообщения
        const {id} = action

        const newMessages = map(messages, message => {
            if (message.id === id) {

                return {...message, isSend: true}
            }

            return message
        })

        return {
            ...state,
            messages: newMessages
        }
    }
}

export default service
