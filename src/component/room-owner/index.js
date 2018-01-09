/**
 * Компонент с логикой комнаты Собственника
 */

import React, {Component} from 'react'
import PropTypes from 'prop-types'

import PoolPeerConnection from '../../lib/pool-connection'

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
        messages: PropTypes.array
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

    async componentDidMount() {
        //  получаем доступ к камере и микрофону
        const ownerMedia = await navigator
            .mediaDevices
            .getUserMedia(constraints)

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
                console.log('[peerConnection.channel.owner] get message chat', JSON.parse(event.data))
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

    render() {

        return (<Room
            ownerMedia={this.state.ownerMedia}
            visitorMedia={this.state.visitorMedia}/>)
    }
}

export default RoomOwner
