import lodash from "lodash";
import {handleActions} from "redux-actions";
import {LoggerFactory} from "darch/src/utils";

let Logger = new LoggerFactory("common.order_item.reducer", {level:"debug"});

let initialState = {
    data: {},
    scope: {}
};

export default handleActions({
    orderItemFind_COMPLETED(state, action) {
        let ids,
            newState = {},
            scope = lodash.get(action, "payload.scope"),
            logger = Logger.create("orderItemFind_COMPLETED");

        logger.info("enter", {action});

        // If has scope, then process.
        if(scope && lodash.isObject(scope)){
            if(action.payload.concat) {
                ids = (lodash.get(state.scope,`${scope.id}.ids`)||[]).concat(lodash.map(action.payload.data, "_id"));
            }
            else {
                ids = lodash.map(action.payload.data, "_id");
            }

            // Update scope
            newState.scope = Object.assign({}, state.scope, {
                [scope.id]: Object.assign({}, scope, {
                    ids,
                    query: action.payload.query
                })
            });
        }

        // Reduce data.
        let {data} = lodash.reduce(action.payload.data, (result, record) => {
            result.data[record._id] = record;
            return result;
        }, {data:{}});

        // Update data.
        newState.data = Object.assign({}, state.data, data);

        // Log new state
        logger.info("newState", newState);

        // Return new state
        return Object.assign({}, state, newState);
    },

    orderItemUpdatedEvent_COMPLETED(state, action) {
        let logger = Logger.create("orderItemUpdatedEvent_COMPLETED");
        logger.info("enter", {state, action});

        return Object.assign({}, state, {
            data: Object.assign({}, state.data, {
                [action.payload._id]: action.payload.data
            })
        });
    },

    signinPageOpened() {
        let logger = Logger.create("signinPageOpened");
        logger.info("enter");

        return {
            data: {},
            scope: {}
        };
    }
}, initialState);
