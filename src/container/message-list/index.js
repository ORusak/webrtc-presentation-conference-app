/**
 * Компонент контейнер элементов управления чатом
 */
import {connect} from 'react-redux'

import MessageList from '../../component/chat/message-list'

//  actions

const mapStateToProps = (state) => {

    return {
        list: state.chat.messages,
        user: state.user,
    }
}

const MessageListContainer = connect(mapStateToProps)(MessageList)

export default MessageListContainer
