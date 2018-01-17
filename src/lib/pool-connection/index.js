/**
 * Библиотека поддержки множественных RTCPeerConnection
 * 
 * Продублируем нужное API RTCPeerConnection для начальной гибкости и простоты решения.
 * В дальнейшем можно упростить API вынеся во внутрь типовые операции.
 * 
 * Реализация подразумевает, что у всех соединений одинаковые обработчики. Если будут сценарии 
 * при которых требуются также индивидуальные нужно будет доработать.
 */

//  todo: вынести в настройки или в переменные окружения

import forEach from 'lodash/forEach'
import isFunction from 'lodash/isFunction'

//  todo: переделать интерфейсные методы на единую инициализацию через Proxy

const configuration = {
    iceServers: [
        {
            urls: [
                'stun:stun.services.mozilla.org',
                'stun:stun.l.google.com:19302',
            ]
        }
    ]
}

/**
 * Обработчик proxy get 
 * Для расширяемого вызова методов RTCPeerConnection в коллекции соединений
 * 
 * @param {*} target 
 * @param {*} prop 
 */
function handlerMultiCall (target, prop) {
    const isRTCPeerMethod = prop in RTCPeerConnection.prototype && isFunction(RTCPeerConnection.prototype[prop])
    
    console.debug('[PoolPeerConnection.handlerMultiCall] isRTCPeerMethod', {prop, isRTCPeerMethod})

    if (isRTCPeerMethod) {

        return function (id, ...rest) {
            if (id) {
                const {peer} = target._pool[id]

                return Reflect.apply(peer[prop], peer, rest)
            }
    
            throw new Error('[PoolPeerConnection.handlerMultiCall] Expected connection id')
        }
    }

    return Reflect.get(...arguments)
}

/**
 * Обработчик proxy set 
 * Для расширяемой инициализации обработчиков событий методов RTCPeerConnection в коллекции соединений
 * 
 * @param {*} target 
 * @param {*} prop 
 * @param {*} value
 */
function handlerMultiSet (target, prop, value) {
    const isRTCPeerProp = prop in RTCPeerConnection.prototype
    const isEventHandlerProp = prop.indexOf('on') === 0
    //  отдельная обработка
    const isOnDataChannel = prop === 'ondatachannel'

    console.debug('[PoolPeerConnection.handlerMultiSet] Condition', {isRTCPeerProp, isEventHandlerProp, isOnDataChannel})

    if (isRTCPeerProp && isEventHandlerProp && !isOnDataChannel) {

        target[`_${prop}`] = value

        forEach(target._pool, (conn, id) => {

            conn.peer[prop] = value.bind(conn, id)
        })

        return true
    }

    return Reflect.set(...arguments)
}

//  todo: Добавить метод удаления соединения из пула
//  Например, при обрыве соединения
class PoolPeerConnection {

    constructor () {
        //  todo: изучить вариант заменить на WeekMap
        //  по идее если сборщик решил что соединение не нужно, то и нам оно уже не нужно

        /**
         * @typedef Connection
         * 
         * @prop {object} peer соединение
         * @prop {object} channels список data соединений. где ключ label, значение - экземпляр
         * 
         */

        /**
         * @typedef Pool
         * 
         * Ассоциативный массив Connection. Где ключ - идентификатор соединения сокета собеседника.
         */
        this._pool = {}

        return new Proxy(this, {
            get: handlerMultiCall,
            set: handlerMultiSet,
        })
    }

    add (id) {
        if (id) {
            const peer = RTCPeerConnection(configuration)

            this._pool[id] = { 
                peer,
                channels: {}
             }
            peer.ontrack = this._ontrack.bind(peer, id)
            peer.onicecandidate = this._onicecandidate.bind(peer, id)
            peer.ondatachannel = this._ondatachannel.bind(peer, id)

            return peer
        }

        throw new Error('[PoolPeerConnection.add] Expected connection id')
    }
 
    /**
     * Оберертка для указания целевого соеденения
     * 
     * @param {string} id 
     * 
     * @returns {RTCSessionDescription} -
     */
    getLocalDescription(id) {
        if (id) {
            
            return this._pool[id].peer.localDescription
        }

        throw new Error('[PoolPeerConnection.getLocalDescription] Expected connection id')
    }

    sendAll (label, data) {

        forEach(this._pool, (conn, id) => {
            const channel = conn.channels[label]

            if (channel) {
                channel.send(JSON.stringify(data))

                return null
            }

            throw new Error(`[PoolPeerConnection.sendAll] Peer [${id}]. Not found channel with label [${label}]`)
        })
    }

    set ondatachannel (callback) {
        //  общий обработчик должен сохранить ссылку на новый канал
        //  для использования в дальнейшем для рассылок сообщений
        this._ondatachannel = (id, event) => {
            const {channel} = event
            const {label} = channel

            this._pool[id].channels[label] = channel

            callback(id, event)
        }

        forEach(this._pool, (conn, id) => {

            conn.peer.ondatachannel = callback.bind(conn, id)
        })
    }
}

export default PoolPeerConnection
