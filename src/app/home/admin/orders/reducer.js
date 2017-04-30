import {handleActions} from "redux-actions";
import {LoggerFactory} from "darch/src/utils";

let Logger = new LoggerFactory("admin.orders.reducer", {level:"debug"});

let initialState = {
    data: null,
    query: null,
    products: null
};

export default handleActions({
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
