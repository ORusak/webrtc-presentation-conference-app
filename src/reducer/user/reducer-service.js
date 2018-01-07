/**
 * Сервис сверток данных пользователя
 */

 const service = {
    setUserType (state, action) {

        return { ...state, type: action.userType }
    }
 }

 export default service
