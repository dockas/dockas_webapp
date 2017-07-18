import {handleActions} from "redux-actions"
import {LoggerFactory} from "darch/src/utils"
import lodash from "lodash"

let Logger = new LoggerFactory("common.list.reducer", {level:"debug"})

let initialState = {
    data: {},
    listIdToId: {},
    scope: {}
}

export default handleActions({
    listSubscriptionCreate_COMPLETED(state, action) {
        let logger = Logger.create("listSubscriptionCreate_COMPLETED")
        logger.info("enter", {state, action})

        // Add created product.
        return Object.assign({}, state, {
            listIdToId: Object.assign({}, state.listIdToId, {
                [action.payload.list]: action.payload._id
            }),

            data: Object.assign({}, state.data, {
                [action.payload._id]: action.payload
            })
        })
    },

    listSubscriptionFind_COMPLETED(state, action) {
        let ids,
            newState = {},
            scope = lodash.get(action, "payload.scope"),
            logger = Logger.create("listSubscriptionFind_COMPLETED")

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
        let {data,listIdToId} = lodash.reduce(action.payload.data, (result, record) => {
            result.data[record._id] = record
            result.listIdToId[record.list] = record._id
            return result
        }, {data:{}, listIdToId: {}})

        // Update data.
        newState.data = Object.assign({}, state.data, data)
        newState.listIdToId = Object.assign({}, state.listIdToId, listIdToId)

        // Log new state
        logger.info("newState", newState)

        // Return new state
        return Object.assign({}, state, newState)
    },

    listSubscriptionUpdatedEvent_COMPLETED(state, action) {
        let logger = Logger.create("listSubscriptionUpdatedEvent_COMPLETED")
        logger.info("enter", {state, action})

        return Object.assign({}, state, {
            data: Object.assign({}, state.data, {
                [action.payload._id]: action.payload.data
            })
        })
    },

    signinPageOpened(state) {
        let logger = Logger.create("signinPageOpened")
        logger.info("enter")

        return Object.assign({}, state, {
            data: {},
            scope: {}
        })
    }
}, initialState)
