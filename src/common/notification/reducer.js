import lodash from "lodash";
import {handleActions} from "redux-actions";
import {LoggerFactory} from "darch/src/utils";

let Logger = new LoggerFactory("common.notification.reducer", {level:"debug"});

let initialState = {
    data: null,
    newCount: 0
};

export default handleActions({
    notificationCreatedEvent(state, action) {
        let logger = Logger.create("notificationCreatedEvent");
        logger.info("enter", {state, action});

        return Object.assign({}, state, {
            newCount: state.newCount+1
        });
    },

    notificationUpdatedEvent(state, action) {
        let logger = Logger.create("notificationUpdatedEvent");
        logger.info("enter", {state, action});

        let {notification,updated} = action.payload;
        let newState = state;

        let stateNotification = lodash.find(state.data, (stateNotification) => {
            return stateNotification._id == notification._id;
        });

        if(stateNotification) {
            logger.debug("notification found");

            Object.assign(stateNotification, updated);

            newState = Object.assign({}, newState, {
                data: lodash.clone(state.data)
            });
        }

        // New notification changed it's status, so decrement
        // new count.
        if(stateNotification.status === 0 && updated.status !== 0) {
            newState = Object.assign({}, newState, {
                newCount: newState.newCount-1
            });
        }

        return newState;
    },

    notificationNewCount_COMPLETED(state, action) {
        let logger = Logger.create("notificationNewCount_COMPLETED");
        logger.info("enter", {state, action});

        return Object.assign({}, state, {
            newCount: action.payload
        });
    },

    notificationFind_COMPLETED(state, action) {
        let logger = Logger.create("notificationFind_COMPLETED");
        logger.info("enter", {state, action});

        return Object.assign({}, state, {
            data: action.payload.data
        });
    }
}, initialState);
