/**
 * Компонент контейнер приложения.
 * Содержит логику получения ресурсов: локальной камеры, данных участников по p2p.
 */

import React, {Component} from 'react'
import PropTypes from 'prop-types'

import SignalingServer from '../../lib/signaling-server'

import Room from '../room'

const signaling = new SignalingServer()

//  ограничения получения локального медаи потока
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
const configuration = {
    iceServers: [
        {
            urls: 'stun.services.mozilla.org'
        }
    ]
}

class RoomLogic extends Component {

    static propTypes = {
        room: PropTypes.string.isRequired,
        user: PropTypes.shape({
            name: PropTypes.string,
            type: PropTypes.oneOf(['owner', 'visitor', null])
        }),
        setUserType: PropTypes.func.isRequired
    }

    state = {
        //  помещаем ссылку на потоки в сейт приложения, так как это часть производная
        // логики  работы приложения, а не данные. Для хранения в redux storage, как БД,
        // они не подходят.
        ownerMedia: null,
        visitorMedia: null,
        localMedia: null,
        //  список соединений владельца с участниками
        listPeerConnection: []
    }

    async componentDidMount() {
        //  если пользователь собственник
        const localMedia = await navigator
            .mediaDevices
            .getUserMedia(constraints)

        this.setState({localMedia})

        //  Инициализация комнаты на сервере для подключения

        /**
         * упрощенный алгоритм определения владельца комнаты
         * Кто первый провел инициализацию тот собственник.
        */
        signaling.send('init', {
            room: this.props.room
        })

        signaling.oninit = (data) => {
            const {type} = data

            this
                .props
                .setUserType(type)
        }

        //  регистрация обработчиков ошибок
        signaling.onerror = error => {
            console.error('socket error', error)
        }

        //  создание соединения
        const {type} = this.props.user

        if (type === 'visitor') {
            //  создали соединение  установили медиа поток
            const peerConnection = RTCPeerConnection(configuration)

            localMedia
                .getTracks()
                .forEach((track) => peerConnection.addTrack(track, stream))

            // устанавливаем обработчика готовности к обмену
            peerConnection.onnegotiationneeded = async() => {
                try {
                    await peerConnection.setLocalDescription(await peerConnection.createOffer())

                    // отправка владельцу описания медиа
                    signaling.send('sdp', pc.localDescription)
                } catch (err) {
                    console.error('onnegotiationneeded', err)
                }
            }

            peerConnection.onicecandidate = ({candidate}) => {
                console.log('[peerConnection.onicecandidate] get candidate', candidate)

                if (candidate) {
                    signaling.send('ice', candidate)
                }
            }

            peerConnection.ontrack = (remoteMedia) => {
                console.log('[peerConnection.ontrack] get remote media', remoteMedia)
    
                //  если уже установили, не ставим еще раз
                if (this.state.ownerMedia) {
                    return null
                }
    
                this.setState({ownerMedia: remoteMedia})
            }

            signaling.onsdp = async desc => {
                console.log('[signaling.onsdp] get sdp desc', desc)

                //  интересуют только пакеты ответы, так как посетитель инициатор
                if (desc.type !== 'answer') {
                    console.log('[signaling.onsdp] wrong type sdp')

                    return null
                }

                await peerConnection.setRemoteDescription(desc)
            }

            signaling.onice = async candidate => {
                console.log('[signaling.onice] get candidate', candidate)

                peerConnection.addIceCandidate(candidate)
            }
        }

        if (type === 'owner') {
            //  владелец ожидает приглашений
            signaling.onsdp = async desc => {
                console.log('[signaling.onsdp] get sdp desc', desc)

                //  интересуют только пакеты ответы, так как посетитель инициатор
                if (desc.type !== 'offer') {
                    console.log('[signaling.onsdp] wrong type sdp')

                    return null
                }

                //  создали соединение установили медиа поток
                const peerConnection = RTCPeerConnection(configuration)

                localMedia
                    .getTracks()
                    .forEach((track) => peerConnection.addTrack(track, stream))

                await peerConnection.setRemoteDescription(desc)
                await peerConnection.setLocalDescription(await peerConnection.createAnswer())

                signaling.send('sdp', peerConnection.localDescription)

                peerConnection.onicecandidate = ({candidate}) => {
                    console.log('[peerConnection.onicecandidate] get candidate', candidate)

                    if (candidate) {
                        signaling.send('ice', candidate)
                    }
                }
    
                peerConnection.ontrack = (remoteMedia) => {
                    console.log('[peerConnection.ontrack] get remote media', remoteMedia)
        
                    //  если уже установили, не ставим еще раз
                    if (this.state.visitorMedia) {
                        return null
                    }
        
                    this.setState({visitorMedia: remoteMedia})
                }
    
                signaling.onice = async candidate => {
                    console.log('[signaling.onice] get candidate', candidate)
    
                    peerConnection.addIceCandidate(candidate)
                }
            }
        }
    }

    shouldComponentUpdate(nextProps, nextState) {

        if (this.props.user.type === nextProps.user.type) {

            return false
        }

        console.log('update')

        return true
    }

    async componentWillReceiveProps(nextProps) {
        //  если пользователь собственник
        let localMedia = this.state.localMedia
        const {type} = nextProps.user

        if (type === 'owner') {

            this.setState({ownerMedia: localMedia, visitorMedia: null})
        }
        if (type === 'visitor') {

            this.setState({visitorMedia: localMedia, ownerMedia: null})
        }
    }

    render() {

        return (<Room
            ownerMedia={this.state.ownerMedia}
            visitorMedia={this.state.visitorMedia}/>)
    }
}

export default RoomLogic
