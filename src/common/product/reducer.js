import {handleActions} from "redux-actions";
import {LoggerFactory} from "darch/src/utils";
import lodash from "lodash";

let Logger = new LoggerFactory("common.product.reducer", {level:"debug"});

let initialState = {
    scope: {},
    selected: null
};

export default handleActions({
    productSelect(state, action) {
        var logger = Logger.create("productSelect");
        logger.info("enter", {state,action});

        return Object.assign({}, state, {
            selected: action.payload
        });
    },

    productCreate_COMPLETED(state, action) {
        let logger = Logger.create("productCreate_COMPLETED");
        logger.info("enter", {state, action});

        return state;
    },

    productFind_COMPLETED(state, action) {
        let data,
            scope = lodash.get(action, "payload.scope"),
            logger = Logger.create("productFind_COMPLETED");

        logger.info("enter", {state, action});

        if(!scope||!lodash.isObject(scope)){return;}

        if(action.payload.concat) {
            data = (lodash.get(state.scope,`${scope.id}.data`)||[]).concat(action.payload.data);
        }
        else {
            data = action.payload.data;
        }

        return {
            scope: Object.assign(
                {},
                state.scope,
                {
                    [scope.id]: Object.assign({}, scope, {
                        data,
                        query: action.payload.query
                    })
                }
            )
        };
    },

    productUpdatedEvent_COMPLETED(state, action) {
        let logger = Logger.create("productUpdatedEvent_COMPLETED");
        logger.info("enter", {state, action});

        let {scope,selected} = state;

        //console.log(["balofo colo", scope]);

        scope = lodash.reduce(scope, (result, scope, id) => {
            let {data,query} = scope;

            //console.log(["balofo colo : one", id, data, query, scope, action]);

            let idx = lodash.findIndex(data, (product) => {
                return product._id == action.payload._id;
            });

            //console.log(["balofo colo : idx", idx]);

            if(idx >= 0) {
                data.splice(idx, 1, lodash.merge({}, data[idx], action.payload.data, lodash.get(action,"payload.opts.data")));
            }

            //console.log(["balofo colo : data", data]);

            return Object.assign(result, {
                [id]: Object.assign(scope, {
                    data: lodash.clone(data),
                    query
                })
            });
        }, {});

        //console.log(["balofo colo : new scope", scope, action, selected]);

        if(selected && selected._id == action.payload._id) {
            selected = lodash.assign({}, lodash.clone(selected), action.payload.data, lodash.get(action,"payload.opts.data"));

            //console.log(["balofo colo : update selected", scope, selected]);
        }

        return {
            scope,
            selected
        };
    },

    signinPageOpened() {
        let logger = Logger.create("signinPageOpened");
        logger.info("enter");

        return {
            scope: {},
            selected: null
        };
    }
}, initialState);
