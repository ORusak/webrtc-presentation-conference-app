/**
 * Created by Oleg Rusak on 15.07.2017.
 */

import { combineReducers } from 'redux'

import user from './user'
import room from './room'
import chat from './chat'

export default combineReducers({
  user,
  room,
  chat
})
