import {handleActions} from "redux-actions";
import {LoggerFactory} from "darch/src/utils";
//import lodash from "lodash";

let Logger = new LoggerFactory("common.location.reducer", {level:"debug"});

let initialState = {
    pathname: ""
};

export default handleActions({
    locationChange(state, action) {
        let logger = Logger.create("locationChange");
        logger.info("enter", {state: state, action: action});

        let newState = {pathname: window.location.pathname};

        if(action.payload) {
            newState.pathname = action.payload.pathname;
        }

        return newState;
    }
}, initialState);
