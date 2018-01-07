/**
 * Интерфейс для работы с сигнальным сервером
 * - разделяем сообщения sdp и ice для выделения отдельного слоя
 * логики обработки
 *
 */

import io from 'socket.io-client'

//  список генерируемых событий обрабатываемых сервером
const allowEventType = [
    'init',
    'sdp',
    'ice'
]

class SignalingServer {
    constructor() {

        this._socket = io('http://localhost:8080')
    }

    send (type, data) {
        if (allowEventType.includes(type)) {
            this._socket.emit(type, data)
        }
        
        throw new Error('Wrong type signal')
    }

    set oninit (callback) {
        this._initCallback = callback

        this._socket.on('init', callback)
    }

    get oninit () {
        
        return this._initCallback
    }

    set onsdp (callback) {
        this._sdpCallback = callback

        this._socket.on('sdp', callback)
    }

    get onsdp () {
        
        return this._sdpCallback
    }

    set onice (callback) {
        this._iceCallback = callback

        this._socket.on('ice', callback)
    }

    get onice () {
        
        return this._iceCallback
    }

    set onerror (callback) {
        this._errorCallback = callback

        this._socket.on('error', errorFactory('general', callback))
        this._socket.on('reconnect_error', errorFactory('reconnect', callback))
        this._socket.on('connect_error', errorFactory('connect', callback))
    }

    get onerror () {
        
        return this._errorCallback
    }
}

function errorFactory (type, callback) {

    return function errorHandler (error) {

        return callback({
            type,
            error
        }) 
    }
}

export default SignalingServer
