/**
 * Компонент загрузки комнаты в зависимости от типа пользователя.
 * 
 */

import React, {Component} from 'react'
import PropTypes from 'prop-types'
import isNil from 'lodash/isNil'

import SignalingServer from '../../lib/signaling-server'

import Room from '../room'
import RoomOwner from '../room-owner'
import RoomVisitor from '../room-visitor'

//  todo: вынести в переменные окружения
const urlSignalingServer = 'http://localhost:8080'

class RoomLogic extends Component {
    static defaultProps = {
        messages: []
    }

    static propTypes = {
        room: PropTypes.string.isRequired,
        user: PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string,
            type: PropTypes.oneOf(['owner', 'visitor', null])
        }),
        messages: PropTypes.array,
        setUserType: PropTypes.func.isRequired,
        addReceiveMessage: PropTypes.func.isRequired,
        setMessageAsSend: PropTypes.func.isRequired,
    }

    state = {
        //  экземпляр связи с сигнальным сервером
        //  компонента связана с параметром комнаты, если комната поменяется 
        //  нужно будет переинициализировать связь
        signaling: null
    }

    async componentDidMount() {
        //  комната определяет сеанс связи между участниками
        const room = this.props.room
        const options = {
            room,
            url: urlSignalingServer
        }
        const signaling = new SignalingServer(options)

        this.setState({signaling})

        //  Инициализация комнаты на сервере для подключения
        /**
         * упрощенный алгоритм определения владельца комнаты
         * Кто первый провел инициализацию тот собственник.
        */
        signaling.send('init')
        signaling.oninit = (data) => {
            const {type} = data

            this
                .props
                .setUserType(type)
        }

        //  todo: добавить обработку ошибок
        //  регистрация обработчиков ошибок
        signaling.onerror = error => {
            console.error('socket error', error)
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        // const isChangeUserType = this.props.user.type !== nextProps.user.type

        // if (!isChangeUserType) {

        //     return false
        // }

        console.log('[RoomLogic.shouldComponentUpdate] Call update')

        return true
    }

    render() {
        const {user, messages, addReceiveMessage, setMessageAsSend} = this.props
        const isTypeNotDefine = isNil(user.type)
        
        if (isTypeNotDefine) {
            return <Room/>
        }
        
        const RoomComponent = user.type === 'owner' ? RoomOwner : RoomVisitor

        return <RoomComponent 
            signaling={this.state.signaling} 
            user={user}
            messages={messages}
            addReceiveMessage={addReceiveMessage}
            setMessageAsSend={setMessageAsSend}/>
    }
}

export default RoomLogic
