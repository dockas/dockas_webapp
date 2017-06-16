import lodash from "lodash";
import {handleActions} from "redux-actions";
import {LoggerFactory} from "darch/src/utils";

let Logger = new LoggerFactory("common.tag.reducer", {level:"debug"});

let initialState = {
    scope: {},
    selected: null
};

export default handleActions({
    tagFind_COMPLETED(state, action) {
        let logger = Logger.create("tagFind_COMPLETED");
        logger.info("enter", {action});

        let {data,dropdown,query,scope} = action.payload;

        if(!scope||!lodash.isObject(scope)){return;}

        return {
            scope: Object.assign(
                {},
                state.scope,
                {
                    [scope.id]: Object.assign({}, scope, {
                        data,
                        dropdown,
                        query
                    })
                }
            )
        };
    },

    /*orderUpdatedEvent(state, action) {
        let logger = Logger.create("orderUpdatedEvent");
        logger.info("enter", {state, action});

        let {scope,selected} = state;

        scope = lodash.reduce(scope, (result, scope, id) => {
            let {data,query} = scope;

            let idx = lodash.findIndex(data, (order) => {
                return order._id == action.payload._id;
            });

            if(idx >= 0) {
                data.splice(idx, 1, lodash.merge({}, data[idx], action.payload.data, lodash.get(action,"payload.opts.data")));
            }

            return Object.assign(result, {
                [id]: Object.assign(scope, {
                    data: lodash.clone(data),
                    query
                })
            });
        }, {});

        if(selected && selected._id == action.payload._id) {
            selected = lodash.assign({}, lodash.clone(selected), action.payload.data, lodash.get(action,"payload.opts.data"));
        }

        return {
            scope,
            selected
        };
    },*/
}, initialState);
