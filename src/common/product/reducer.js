import {handleActions} from "redux-actions";
import {LoggerFactory} from "darch/src/utils";
//import lodash from "lodash";

let Logger = new LoggerFactory("common.user.reducer", {level:"debug"});

let initialState = {
    data: null
};

export default handleActions({
    productCreate_COMPLETED(state, action) {
        let logger = Logger.create("productCreate_COMPLETED");
        logger.info("enter", {state: state, action: action});

        return state;
    },

    productFind_COMPLETED(state, action) {
        let logger = Logger.create("productFind_COMPLETED");
        logger.info("enter", {state: state, action: action});

        return {data: action.payload};
    }
}, initialState);
