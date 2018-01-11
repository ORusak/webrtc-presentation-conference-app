/**
 * Компонент с логикой комнаты Собственника
 */

import React, {Component} from 'react'
import PropTypes from 'prop-types'

import PoolPeerConnection from '../../lib/pool-connection'
import MediaService from '../../service/media'

import Room from '../room'

class RoomOwner extends Component {
    static defaultProps = {
        messages: []
    }

    static propTypes = {
        user: PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string,
            type: PropTypes.oneOf(['owner'])
        }),
        messages: PropTypes.array,
        setMessageAsSend: PropTypes.func.isRequired,
        addReceiveMessage: PropTypes.func.isRequired,
    }

    state = {
        //  помещаем ссылку на потоки в сейт приложения, так как это часть производная
        // логики  работы приложения, а не данные. Для хранения в redux storage, как БД,
        // они не подходят.
        visitorMedia: null,
        ownerMedia: null,
        //  список соединений владельца с участниками
        poolConnectionVisitors: new PoolPeerConnection()
    }

    sendMessage = (message) => {
        const {poolConnectionVisitors} = this.state
        const label = 'chat'

        //  в спецификации не понятно как точно узнать, что сообщение 
        //  доставлено. в первичной реалиации считаем что это всегда успешно
        //  
        //  по идее можно подписаться на onerror и там установить, что сообщение не доставлено
        //  или требовать подтвержения с получателя
        //  todo: реаализовать обработку гарантированной доставки сообщения
        poolConnectionVisitors.sendAll(label, message)

        this.props.setMessageAsSend(message.id)
    }

    async componentDidMount() {
        //  получаем доступ к камере и/или микрофону
        const ownerMedia = await MediaService.getUserMedia()

        this.setState({ownerMedia})

        //  регистрируем обработчики соединений с сигнальным сервером и peer
        const {poolConnectionVisitors} = this.state
        const {signaling} = this.props

        //  владелец ожидает приглашений
        signaling.onsdp = async(data) => {
            const {payload} = data
            const {desc} = payload

            const author = data.author

            poolConnectionVisitors.add(author)

            ownerMedia
                .getTracks()
                .forEach((track) => poolConnectionVisitors.addTrack(author, track, ownerMedia))

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
                        desc: poolConnectionVisitors.getLocalDescription(author)
                    },
                    author
                })
            } catch (error) {
                console.error('[peerConnection.onicecandidate.owner]', error)
            }
        }

        poolConnectionVisitors.onicecandidate = (id, {candidate}) => {
            console.log('[peerConnection.onicecandidate.owner] get candidate', candidate)

            if (candidate) {
                console.log('[peerConnection.onicecandidate.owner] send candidate', id)

                signaling.send('ice', {
                    payload: {
                        candidate
                    },
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

            this.setState({visitorMedia: remoteMedia})
        }

        poolConnectionVisitors.ondatachannel = (id, event) => {
            const channel = event.channel

            channel.onopen = () => {
                console.log('[peerConnection.channel.owner] enable chat')
            }
            channel.onmessage = (event) => {
                const {id, text, user, date} = JSON.parse(event.data)

                console.log('[peerConnection.channel.onmessage] get message chat', id)

                //  фильтрация сообщений

                //  если нам прислали наши же сообщения. например при общей рассылке-синхронизации
                const isOwnMessage = this.props.user.id === user.id

                if (isOwnMessage) {
                    console.log('[peerConnection.channel.chat.onmessage] skip own message', id)

                    return null
                }
                
                //  устанавливаем в не отправлено, так как будем делать рассылку на 
                //  всех участников
                const isSend = false

                this.props.addReceiveMessage(id, text, user, date, isSend)
            }
        }

        signaling.onice = ({payload, author}) => {
            const {candidate} = payload

            console.log('[signaling.onice] get candidate.owner', author, candidate)

            poolConnectionVisitors.addIceCandidate(author, candidate)
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        // const isChangeUserType = this.props.user.type !== nextProps.user.type const
        // isChangeRemoteMedia = this.state.ownerMedia !== nextState.ownerMedia     ||
        // this.state.visitorMedia !== nextState.visitorMedia if (!isChangeUserType &&
        // !isChangeRemoteMedia) {     return false }

        console.log('[RoomOwner.shouldComponentUpdate] Call update')

        return true
    }

    componentDidUpdate (prevProps, prevState) {
        const {messages} = this.props

        messages.forEach(this.sendMessage) 
    }

    render() {

        return (<Room
            ownerMedia={this.state.ownerMedia}
            visitorMedia={this.state.visitorMedia}
            owner={this.props.user}/>)
    }
}

export default RoomOwner
