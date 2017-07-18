import {handleActions} from "redux-actions"
import {LoggerFactory} from "darch/src/utils"
import lodash from "lodash"

let Logger = new LoggerFactory("common.company.reducer", {level:"debug"})

let initialState = {
    data: {},
    scope: {}
}

export default handleActions({
    companyFind_COMPLETED(state, action) {
        let ids,
            newState = {},
            scope = lodash.get(action, "payload.scope"),
            logger = Logger.create("companyFind_COMPLETED")

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
        let {data} = lodash.reduce(action.payload.data, (result, record) => {
            result.data[record._id] = record
            return result
        }, {data:{}})

        // Update data.
        newState.data = Object.assign({}, state.data, data)

        // Get only keys.
        ids = Object.keys(ids)

        // If no ids to fetch, then resolve right away.
        if(ids.length === 0) {
            return Promise.resolve()
        }

        logger.info("newState", newState)

        // Return new state
        return Object.assign({}, state, newState)
    },

    signinPageOpened(state) {
        let logger = Logger.create("signinPageOpened")
        logger.info("enter")

        return Object.assign({}, state, {
            scope: {},
            selected: null
        })
    }
}, initialState)
