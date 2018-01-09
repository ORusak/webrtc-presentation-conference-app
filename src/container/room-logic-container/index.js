/**
 * Компонент контейнер компоненты логики комнаты
 */
import {connect} from 'react-redux'
import filter from 'lodash/filter'

import RoomLogic from '../../component/room-logic'

//  actions
import {setUserType} from '../../reducer/user'
import {addReceiveMessage, setMessageAsSend} from '../../reducer/chat'

const mapStateToProps = (state) => {

    return {
        room: state.room.id,
        user: state.user,
        messages: filter(state.chat.messages, ({isSend}) => !isSend)
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {

    return {
        setUserType: type => {

            dispatch(setUserType(type))

            return null
        },

        setMessageAsSend: id => {
            dispatch(setMessageAsSend(id))

            return null
        }, 

        addReceiveMessage: (id, text, user, date, isSend) => {
            dispatch(addReceiveMessage(id, text, user, date, isSend))

            return null
        },
    }
}

const RoomLogicContainer = connect(mapStateToProps, mapDispatchToProps)(RoomLogic)

export default RoomLogicContainer
