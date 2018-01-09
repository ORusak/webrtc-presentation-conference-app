/**
 * Компонент с логикой комнаты Посетителя
 */

import React, {Component} from 'react'
import PropTypes from 'prop-types'

import Room from '../room'

//  ограничения получения локального медиа потока
const constraints = {
    video: {
        width: {
            exact: 360
        },
        height: {
            exact: 199
        }
    },
    audio: true
}

//  todo: вынести в настройки или в переменные окружения
const configuration = {
    iceServers: [
        {
            urls: 'stun:stun.services.mozilla.org'
        }
    ]
}

class RoomVisitor extends Component {
    static defaultProps = {
        messages: []
    }

    static propTypes = {
        user: PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string,
            type: PropTypes.oneOf(['visitor'])
        }),
        messages: PropTypes.array,
        addMessage: PropTypes.func.isRequired,
    }

    state = {
        //  помещаем ссылку на потоки в сейт приложения, так как это часть производная
        // логики  работы приложения, а не данные. Для хранения в redux storage, как БД,
        // они не подходят.
        ownerMedia: null,
        visitorMedia: null,
        //  
        peerConnection: RTCPeerConnection(configuration)
    }

    async componentDidMount() {
        //  получаем доступ к камере и микрофону
        const visitorMedia = await navigator
            .mediaDevices
            .getUserMedia(constraints)

        this.setState({visitorMedia})

        //  регистрируем обработчики соединений с сигнальным сервером и peer
        
        const {peerConnection} = this.state
        const {signaling} = this.props

        //  установили медиа поток
        visitorMedia
            .getTracks()
            .forEach((track) => peerConnection.addTrack(track, visitorMedia))

        /**
         * todo: Разобраться с множественным срабатыванием события onnegotiationneeded
         * 
         * Событие onnegotiationneeded срабатывает (3 раза сейчас). Собственнику комнаты уходит 
         * 3 приглашения, что приводит к ошибке установки sdp, ice пакетов. 
         * Ошибка - падение что данные пакета не разрезолвенный promise. Хотя в лог перед установкой выводятся нормальные 
         * объекты. Возможно проблема в асинхронной установке или в полифилах async/await.
         * 
         * Событие срабатывает несколько раз правильно. Судя по всему, это реакция на добавление в соединение 
         * новых треков. Но не понятно почему такая реакция при обработке множественных sdp, ice пакетов.
         * visitorMedia
            .getTracks()
            .forEach((track) => peerConnection.addTrack(track, visitorMedia))
         * 
         */
        let isSend = false

        // устанавливаем обработчика готовности к обмену
        peerConnection.onnegotiationneeded = async(event) => {
            console.log('[peerConnection.onnegotiationneeded.visitor] start', event)

            if (isSend) {
                console.log('[peerConnection.onnegotiationneeded.visitor] duplicate')

                return null
            }

            isSend = true

            try {
                const descOffer = await peerConnection.createOffer()

                console.log('descOffer', descOffer)

                await peerConnection.setLocalDescription(descOffer)

                // отправка владельцу описания медиа
                signaling.send('sdp', {
                    payload: { 
                        desc: peerConnection.localDescription
                    }
                })
            } catch (err) {
                console.error('onnegotiationneeded.visitor', err)
            }
        }

        peerConnection.onicecandidate = ({candidate}) => {
            console.log('[peerConnection.onicecandidate.visitor] get candidate', candidate)

            if (candidate) {
                console.log('[peerConnection.onicecandidate.visitor] send candidate owner', candidate)

                signaling.send('ice', {
                    payload: {candidate}
                })
            }
        }

        peerConnection.ontrack = (event) => {
            const remoteMedia = event.streams[0]

            console.log('[peerConnection.ontrack.visitor] get remote media', remoteMedia)

            //  если уже установили, не ставим еще раз
            if (this.state.ownerMedia) {
                return null
            }

            console.log('[peerConnection.ontrack.visitor] set remote media')

            this.setState({ownerMedia: remoteMedia })
        }

        signaling.onsdp = async ({ payload }) => {
            const { desc } = payload

            console.log('[signaling.onsdp.visitor] get sdp desc', desc)

            //  интересуют только пакеты ответы, так как посетитель инициатор
            if (desc.type !== 'answer') {
                console.log('[signaling.onsdp.visitor] wrong type sdp')

                return null
            }
            
            try {
                await peerConnection.setRemoteDescription(desc)
            } catch (error) {
                console.error('[signaling.onsdp.visitor]', error)
            }
        }

        signaling.onice = ({ payload }) => {
            const { candidate } = payload

            console.log('[signaling.onice.visitor] get candidate', candidate)

            peerConnection.addIceCandidate(candidate)
        }

        // создаем канал для передачи сообщений
        const dataChannelOptions = {
            ordered: false,
        }
        const channel = peerConnection.createDataChannel('chat', dataChannelOptions)

        channel.onopen = () => {
            console.log('[peerConnection.channel] enable chat')
        }
        channel.onmessage = (event) => {
            const {id, text, user, date} = JSON.parse(event.data)

            console.log('[peerConnection.channel.chat.onmessage] get message chat with id', id)

            //  фильтрация сообщений

            //  если нам прислали наши же сообщения. например при общей рассылке-синхронизации
            const isOwnMessage = this.props.user.id === user.id

            if (isOwnMessage) {
                console.log('[peerConnection.channel.chat.onmessage] skip own message', id)

                return null
            }
            
            this.props.addMessage(id, text, user, date)
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        // const isChangeUserType = this.props.user.type !== nextProps.user.type

        // const isChangeRemoteMedia = this.state.ownerMedia !== nextState.ownerMedia
        //     || this.state.visitorMedia !== nextState.visitorMedia
        
        // if (!isChangeUserType && !isChangeRemoteMedia) {

        //     return false
        // }

        console.log('[RoomVisitor.shouldComponentUpdate] Call update')

        return true
    }

    render() {

        return (<Room
            ownerMedia={this.state.ownerMedia}
            visitorMedia={this.state.visitorMedia}/>)
    }
}

export default RoomVisitor