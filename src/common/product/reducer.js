import {handleActions} from "redux-actions";
import {LoggerFactory} from "darch/src/utils";
import lodash from "lodash";

let Logger = new LoggerFactory("common.product.reducer", {level:"debug"});

let initialState = {
    data: {},
    nameIdToId: {},
    scope: {},
    selected: null
};

export default handleActions({
    productAdd(state, action) {
        return Object.assign({}, state, {
            data: Object.assign({}, state.data, {
                [action.payload._id]: action.payload
            })
        });
    },

    productCreate_COMPLETED(state, action) {
        let logger = Logger.create("productCreate_COMPLETED");
        logger.info("enter", {state, action});

        // Add created product.
        return Object.assign({}, state, {
            data: Object.assign({}, state.data, {
                [action.payload._id]: action.payload
            })
        });
    },

    productFind_COMPLETED(state, action) {
        let ids,
            newState = {},
            scope = lodash.get(action, "payload.scope"),
            logger = Logger.create("productFind_COMPLETED");

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
        let {data,nameIdToId} = lodash.reduce(action.payload.data, (result, record) => {
            result.data[record._id] = record;
            result.nameIdToId[record.nameId] = record._id;
            return result;
        }, {data:{}, nameIdToId:{}});

        // Update data.
        newState.data = Object.assign({}, state.data, data);
        newState.nameIdToId = Object.assign({}, state.nameIdToId, nameIdToId);

        // Log new state
        logger.info("newState", newState);

        // Return new state
        return Object.assign({}, state, newState);
    },

    productFindByNameId_COMPLETED(state, action) {
        let logger = Logger.create("productFindByNameId_COMPLETED");
        logger.info("enter", {action});

        if(!lodash.get(action, "payload.data._id")) {return state;}

        return Object.assign({}, state, {
            nameIdToId: Object.assign({}, state.nameIdToId, {
                [action.payload.data.nameId]: action.payload.data._id
            }),

            data: Object.assign({}, state.data, {
                [action.payload.data._id]: action.payload.data
            })
        });
    },

    productUpdatedEvent_COMPLETED(state, action) {
        let logger = Logger.create("productUpdatedEvent_COMPLETED");
        logger.info("enter", {state, action});

        return Object.assign({}, state, {
            data: Object.assign({}, state.data, {
                [action.payload._id]: action.payload.data
            })
        });
    },

    signinPageOpened(state) {
        let logger = Logger.create("signinPageOpened");
        logger.info("enter");

        return Object.assign({}, state, {
            scope: {},
            selected: null
        });
    }
}, initialState);
