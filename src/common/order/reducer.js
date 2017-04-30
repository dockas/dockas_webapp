import {handleActions} from "redux-actions";
import {LoggerFactory} from "darch/src/utils";

let Logger = new LoggerFactory("common.user.reducer", {level:"debug"});

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
    }
}, initialState);
