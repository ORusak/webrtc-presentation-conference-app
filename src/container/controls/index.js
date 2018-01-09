/**
 * Компонент контейнер элементов управления чатом
 */
import {connect} from 'react-redux'

import Controls from '../../component/chat/controls'

//  actions
import {addMessage, editMessage} from '../../reducer/chat'

const mapStateToProps = (state) => {

    return {
        messageText: state.chat.messageText,
        user: state.user,
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {

    return {
        addMessage: (message, user) => {
            dispatch(addMessage(message, user))

            return null
        },

        editMessage (message) {
            dispatch(editMessage(message))

            return null
        }
    }
}

const ControlsContainer = connect(mapStateToProps, mapDispatchToProps)(Controls)

export default ControlsContainer
