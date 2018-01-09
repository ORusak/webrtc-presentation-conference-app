/**
 * Компонент контейнер компоненты логики комнаты
 */
import {connect} from 'react-redux'

import RoomLogic from '../../component/room-logic'

//  actions
import {setUserType} from '../../reducer/user'

const mapStateToProps = (state) => {

    return {
        room: state.room.id,
        user: state.user,
        messages: state.chat.messages 
    }
}

const mapDispatchToProps = (dispatch, ownProps) => {

    return {
        setUserType: type => {

            dispatch(setUserType(type))

            return null
        },

        setMessageAsSend: id => {

            return null
        }
    }
}

const RoomLogicContainer = connect(mapStateToProps, mapDispatchToProps)(RoomLogic)

export default RoomLogicContainer
