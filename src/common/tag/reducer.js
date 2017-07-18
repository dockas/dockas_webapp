import lodash from "lodash"
import {handleActions} from "redux-actions"
import {LoggerFactory} from "darch/src/utils"

let Logger = new LoggerFactory("common.tag.reducer", {level:"debug"})

let initialState = {
    data: {},
    scope: {},
    dropdown: []
}

export default handleActions({
    /*tagCreate_COMPLETED(state, action) {
        let logger = Logger.create("tagCreate_COMPLETED");
        logger.info("enter", {state, action});

        // Add created product.
        return Object.assign({}, state, {
            data: Object.assign({}, state.data, {
                [action.payload.data._id]: action.payload.data
            }),

            dropdown: state.dropdown.concat([{
                label: action.payload.data.name,
                value: action.payload.data._id,
                color: action.payload.data.color
            }])
        });
    },*/

    tagFind_COMPLETED(state, action) {
        let ids,
            newState = {},
            scope = lodash.get(action, "payload.scope"),
            logger = Logger.create("tagFind_COMPLETED")

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
                    dropdown: action.payload.dropdown,
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
    
        // Generate new global dropdown from new data.
        newState.dropdown = lodash.map(newState.data, (tag) => {
            return {
                label: tag.name,
                value: tag._id,
                color: tag.color
            }
        })

        logger.info("newState", newState)

        // Return new state
        return Object.assign({}, state, newState)
    },

    tagCreatedEvent_COMPLETED(state, action) {
        let logger = Logger.create("tagCreatedEvent_COMPLETED")
        logger.info("enter", {state, action})

        // Add created tag.
        return Object.assign({}, state, {
            data: Object.assign({}, state.data, {
                [action.payload._id]: action.payload.data
            }),

            dropdown: state.dropdown.concat([{
                label: action.payload.data.name,
                value: action.payload.data._id,
                color: action.payload.data.color
            }])
        })
    },

    tagUpdatedEvent_COMPLETED(state, action) {
        let logger = Logger.create("tagUpdatedEvent_COMPLETED")
        logger.info("enter", {state, action})

        return Object.assign({}, state, {
            data: Object.assign({}, state.data, {
                [action.payload._id]: action.payload.data
            })
        })
    },

    tagsUpdatedEvent_COMPLETED(state, action) {
        let logger = Logger.create("tagsUpdatedEvent_COMPLETED")
        logger.info("enter", {state, action})

        let data = lodash.reduce(action.payload.data, (result, tag) => {
            result[tag._id] = tag
            return result
        }, {})

        return Object.assign({}, state, {
            data: Object.assign({}, state.data, data)
        })
    }
}, initialState)
