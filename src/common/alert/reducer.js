import lodash from "lodash";
import {handleActions} from "redux-actions";
import {LoggerFactory} from "darch/src/utils";

let Logger = new LoggerFactory("common.alert.reducer", {level:"debug"});

let initialState = {
    data: null,
    newCount: 0
};

export default handleActions({
    alertCreatedEvent(state, action) {
        let logger = Logger.create("alertCreatedEvent");
        logger.info("enter", {state, action});

        return Object.assign({}, state, {
            newCount: state.newCount+1
        });
    },

    alertUpdatedEvent(state, action) {
        let logger = Logger.create("alertUpdatedEvent");
        logger.info("enter", {state, action});

        let {alert,updated} = action.payload;
        let newState = state;

        let stateAlert = lodash.find(state.data, (stateAlert) => {
            return stateAlert._id == alert._id;
        });

        if(stateAlert) {
            logger.debug("alert found");

            Object.assign(stateAlert, updated);

            newState = Object.assign({}, newState, {
                data: lodash.clone(state.data)
            });
        }

        // New alert changed it's status, so decrement
        // new count.
        if(alert.status == "new" && updated.status != "new") {
            newState = Object.assign({}, newState, {
                newCount: newState.newCount-1
            });
        }

        return newState;
    },

    alertNewCount_COMPLETED(state, action) {
        let logger = Logger.create("alertNewCount_COMPLETED");
        logger.info("enter", {state, action});

        return Object.assign({}, state, {
            newCount: action.payload
        });
    },

    alertFind_COMPLETED(state, action) {
        let logger = Logger.create("alertFind_COMPLETED");
        logger.info("enter", {state, action});

        return Object.assign({}, state, {
            data: action.payload.data
        });
    }
}, initialState);
