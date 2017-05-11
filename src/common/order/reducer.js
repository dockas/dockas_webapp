import lodash from "lodash";
import {handleActions} from "redux-actions";
import {LoggerFactory} from "darch/src/utils";

let Logger = new LoggerFactory("common.order.reducer", {level:"debug"});

let initialState = {
    data: null,
    query: null
};

export default handleActions({
    orderFind_COMPLETED(state, action) {
        let logger = Logger.create("orderFind_COMPLETED");
        logger.info("enter", {state: state, action: action});

        return {
            data: action.payload.data,
            query: action.payload.query
        };
    },

    orderStatusUpdatedEvent(state, action) {
        let logger = Logger.create("orderStatusUpdatedEvent");
        logger.info("enter", {state: state, action: action});

        let {order, updated} = action.payload;

        let stateOrder = lodash.find(state.data, (stateOrder) => {
            return stateOrder._id == order._id;
        });

        if(stateOrder) {
            logger.debug("order found", {stateOrder});

            stateOrder.status = updated.status;

            return lodash.assign({}, state, {
                data: lodash.clone(state.data)
            });
        }

        return state;
    },
}, initialState);
