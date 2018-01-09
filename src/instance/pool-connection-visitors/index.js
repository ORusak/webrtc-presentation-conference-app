/**
 * Создание экземпляра пула подключения посетителей для 
 * возможности работы с ним из разных компонент: логики комнаты и чата.
 */
import PoolPeerConnection from '../../lib/pool-connection'

export default new PoolPeerConnection()
