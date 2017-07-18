import {handleActions} from "redux-actions"
import {LoggerFactory} from "darch/src/utils"
import lodash from "lodash"

let Logger = new LoggerFactory("common.user.reducer", {level:"debug"})

let initialState = {
    uid: null,
    data: {},
    scope: {},
    emailToId: {}
}

export default handleActions({
    signin_COMPLETED(state, action) {
        let logger = Logger.create("signin_COMPLETED")
        logger.info("enter", {action})

        return Object.assign({}, state, {
            uid: action.payload._id,

            data: Object.assign({}, state.data, {
                [action.payload._id]: action.payload
            })
        })
    },

    userInit_COMPLETED(state, action) {
        let logger = Logger.create("userInit_COMPLETED")
        logger.info("enter", {action})

        return Object.assign({}, state, {
            uid: action.payload._id,

            data: Object.assign({}, state.data, {
                [action.payload._id]: action.payload
            })
        })
    },

    userFind_COMPLETED(state, action) {
        let ids,
            newState = {},
            scope = lodash.get(action, "payload.scope"),
            logger = Logger.create("userFind_COMPLETED")

        logger.info("enter", {action})

        // If has scope, then process.
        if(scope && lodash.isObject(scope)){
            if(action.payload.concat) {
                ids = (lodash.get(state.scope,`${scope.id}.ids`)||[]).concat(lodash.map(action.payload.data, "_id"))
            }
            else {
                ids = lodash.map(action.payload.data, "_id")
            }

            // Update scope
            newState.scope = Object.assign({}, state.scope, {
                [scope.id]: Object.assign({}, scope, {
                    ids,
                    query: action.payload.query
                })
            })
        }

        // Reduce data.
        let {data,emailToId} = lodash.reduce(action.payload.data, (result, record) => {
            result.data[record._id] = record
            result.emailToId[record.email] = record._id
            return result
        }, {data:{}, emailToId:{}})

        // Update data.
        newState.data = Object.assign({}, state.data, data)
        newState.emailToId = Object.assign({}, state.emailToId, emailToId)

        // Log new state
        logger.info("newState", newState)

        // Return new state
        return Object.assign({}, state, newState)
    },

    userUpdatedEvent_COMPLETED(state, action) {
        let logger = Logger.create("userUpdatedEvent_COMPLETED")
        logger.info("enter", {state, action})

        return Object.assign({}, state, {
            data: Object.assign({}, state.data, {
                [action.payload._id]: action.payload.data
            })
        })
    },

    signout_COMPLETED(state) {
        let logger = Logger.create("signout_COMPLETED")
        logger.info("enter")

        return Object.assign({}, state, {
            uid: null
        })
    }
}, initialState)
