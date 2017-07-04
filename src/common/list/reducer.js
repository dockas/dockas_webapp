import {handleActions} from "redux-actions";
import {LoggerFactory} from "darch/src/utils";
import lodash from "lodash";

let Logger = new LoggerFactory("common.list.reducer", {level:"debug"});

let initialState = {
    data: {},
    nameIdToId: {},
    scope: {}
};

export default handleActions({
    listCreate_COMPLETED(state, action) {
        let logger = Logger.create("listCreate_COMPLETED");
        logger.info("enter", {state, action});

        // Add created product.
        return Object.assign({}, state, {
            nameIdToId: Object.assign({}, state.nameIdToId, {
                [action.payload.nameId]: action.payload._id
            }),

            data: Object.assign({}, state.data, {
                [action.payload._id]: action.payload
            })
        });
    },

    listFind_COMPLETED(state, action) {
        let ids,
            newState = {},
            scope = lodash.get(action, "payload.scope"),
            logger = Logger.create("listFind_COMPLETED");

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

    listFindByNameId_COMPLETED(state, action) {
        let logger = Logger.create("listFindByNameId_COMPLETED");
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

    listItemQuantityUpdatedEvent_COMPLETED(state, action) {
        let logger = Logger.create("listItemQuantityUpdatedEvent_COMPLETED");
        logger.info("enter", {action});

        // Let's update list in all scopes.
        let newScope = lodash.clone(state.scope);

        for(let scopeId in Object.keys(newScope)) {
            let scope = newScope[scopeId];

            for(let list in scope.data) {
                for(let item in list.items) {
                    if((lodash.get(item.product, "_id")||item.product) == action.payload.product) {
                        item.quantity = action.payload.quantity;
                    }
                }
            }
        }

        return Object.assign({}, state, {
            scope: newScope
        });
    },

    listUpdatedEvent_COMPLETED(state, action) {
        let logger = Logger.create("listUpdatedEvent_COMPLETED");
        logger.info("enter", {state, action});

        return Object.assign({}, state, {
            nameIdToId: Object.assign({}, state.nameIdToId, {
                [action.payload.data.nameId]: action.payload.data._id
            }),
            
            data: Object.assign({}, state.data, {
                [action.payload._id]: action.payload.data
            })
        });
    },

    signinPageOpened(state) {
        let logger = Logger.create("signinPageOpened");
        logger.info("enter");

        return Object.assign({}, state, {
            scope: {}
        });
    }
}, initialState);
