import lodash from "lodash";
import {handleActions} from "redux-actions";
import {LoggerFactory} from "darch/src/utils";

let Logger = new LoggerFactory("admin.orders.reducer", {level:"debug"});

let initialState = {
    data: null,
    query: null,
    products: null
};

export default handleActions({
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

            return Object.assign({}, state, {
                data: lodash.clone(state.data)
            });
        }

        return state;
    },

    adminOrdersFind_COMPLETED(state, action) {
        let logger = Logger.create("adminOrdersFind_COMPLETED");
        logger.info("enter", {state: state, action: action});

        return {
            data: action.payload.data,
            query: action.payload.query
        };
    },

    adminOrdersFindProducts_COMPLETED(state, action) {
        let logger = Logger.create("adminOrdersFind_COMPLETED");
        logger.info("enter", {state: state, action: action});

        return Object.assign({}, state, {
            products: action.payload
        });
    }
}, initialState);