/**
 * Компонент контейнер приложения.
 * Содержит логику получения ресурсов: локальной камеры, данных участников по p2p.
 */

import React, {Component} from 'react'
import PropTypes from 'prop-types'

import SignalingServer from '../../lib/signaling-server'
import poolConnectionVisitors from '../../instance/pool-connection-visitors'

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

//  todo: вынести в переменные окружения
const urlSignalingServer = 'http://localhost:8080'

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
        //  экземпляр обмена сигналами в комнате
        signaling: null,
        //  список соединений владельца с участниками
        listPeerConnection: []
    }

    async componentDidMount() {
        //  если пользователь собственник
        const localMedia = await navigator
            .mediaDevices
            .getUserMedia(constraints)

        //  комната определяет сеанс связи между участниками
        const room = this.props.room
        const options = {
            room,
            url: urlSignalingServer
        }
        const signaling = new SignalingServer(options)

        this.setState({localMedia, signaling})

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

        //  регистрация обработчиков ошибок
        signaling.onerror = error => {
            console.error('socket error', error)
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        const isChangeUserType = this.props.user.type !== nextProps.user.type

        const isChangeRemoteMedia = this.state.ownerMedia !== nextState.ownerMedia
            || this.state.visitorMedia !== nextState.visitorMedia
        
        if (!isChangeUserType && !isChangeRemoteMedia) {

            return false
        }

        console.log('[RoomLogic.shouldComponentUpdate] Call update')

        return true
    }

    //  todo: разбить компоненту на две отдельных для owner и visitor
    //  это позволит получить более управляемые компоненты. С возможностью, например, в дальнейшем 
    //  развести на разные бандлы
    async componentWillReceiveProps(nextProps) {
        //  если пользователь собственник
        const { localMedia, signaling } = this.state
        const { user } = nextProps
        const { type } = user

        if (type === 'owner') {

            this.setState({ownerMedia: localMedia, visitorMedia: null})
        }
        if (type === 'visitor') {

            this.setState({visitorMedia: localMedia, ownerMedia: null})
        }

        //  создание соединения
        if (type === 'visitor') {
            //  создали соединение  установили медиа поток
            const peerConnection = RTCPeerConnection(configuration)

            localMedia
                .getTracks()
                .forEach((track) => peerConnection.addTrack(track, localMedia))

            /**
             * todo: Разобраться с множественным срабатыванием события onnegotiationneeded
             * 
             * Событие onnegotiationneeded срабатывает (3 раза сейчас). Собственнику комнаты уходит 
             * 3 приглашения, что приводит к ошибке установки sdp, ice пакетов. 
             * Ошибка - падение что данные пакета не разрезолвенный promise. Хотя в лог перед установкой выводятся нормальные 
             * объекты. Возможно проблема в асинхронной установке или в полифилах async/await.
             * 
             * Событие срабатывает несколько раз правильно, судя по всему, это реакция на добавление в соединение 
             * новых треков. Но не понятно почему такая реакция при обработке множественных sdp, ice пакетов.
             * localMedia
                .getTracks()
                .forEach((track) => peerConnection.addTrack(track, localMedia))
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
        }

        if (type === 'owner') {
            //  владелец ожидает приглашений
            signaling.onsdp = async (data) => {
                const { payload } = data
                const { desc } = payload

                const author = data.author

                poolConnectionVisitors.add(author)

                localMedia
                    .getTracks()
                    .forEach((track) => poolConnectionVisitors.addTrack(author, track, localMedia))

                console.log('[signaling.onsdp.owner] get sdp desc', desc)

                //  интересуют только пакеты ответы, так как посетитель инициатор
                if (desc.type !== 'offer') {
                    console.log('[signaling.onsdp.owner] wrong type sdp')

                    return null
                }

                try {
                    await poolConnectionVisitors.setRemoteDescription(author, desc)
                    
                    const descAnswer = await poolConnectionVisitors.createAnswer(author)
                    
                    await poolConnectionVisitors.setLocalDescription(author, descAnswer.toJSON())
                    
                    //  отправим ответ автору приглашения
                    signaling.send('sdp', {
                        payload: {
                            desc: poolConnectionVisitors.getLocalDescription(author),
                        },
                        author
                    })
                } catch(error) {
                    console.error('[peerConnection.onicecandidate.owner]', error)
                }
            }

            poolConnectionVisitors.onicecandidate = (id, {candidate}) => {
                console.log('[peerConnection.onicecandidate.owner] get candidate', candidate)

                if (candidate) {
                    console.log('[peerConnection.onicecandidate.owner] send candidate', id)

                    signaling.send('ice', {
                        payload: { candidate },
                        author: id
                    })
                }
            }

            poolConnectionVisitors.ontrack = (id, event) => {
                const remoteMedia = event.streams[0]

                console.log('[peerConnection.ontrack.owner] get remote media', remoteMedia)

                //  если уже установили, не ставим еще раз
                if (this.state.visitorMedia) {
                    return null
                }

                console.log('[peerConnection.ontrack.owner] set remote media', remoteMedia)

                this.setState({visitorMedia: remoteMedia })
            }

            signaling.onice = ({ payload, author }) => {
                const { candidate } = payload

                console.log('[signaling.onice] get candidate.owner', author, candidate)

                poolConnectionVisitors.addIceCandidate(author, candidate)
            }
        }
    }

    render() {

        return (<Room
            ownerMedia={this.state.ownerMedia}
            visitorMedia={this.state.visitorMedia}/>)
    }
}

export default RoomLogic
