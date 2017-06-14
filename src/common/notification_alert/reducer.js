import lodash from "lodash";
import {handleActions} from "redux-actions";
import {LoggerFactory} from "darch/src/utils";

let Logger = new LoggerFactory("common.notification_alert.reducer", {level:"debug"});

let initialState = {
    data: null,
    newCount: 0
};

export default handleActions({
    notificationAlertCreatedEvent(state, action) {
        let logger = Logger.create("notificationAlertCreatedEvent");
        logger.info("enter", {state, action});

        return Object.assign({}, state, {
            newCount: state.newCount+1
        });
    },

    notificationAlertUpdatedEvent(state, action) {
        let logger = Logger.create("notificationAlertUpdatedEvent");
        logger.info("enter", {action});

        let {data,newCount} = state;

        let idx = lodash.findIndex(data, (notification) => {
            return notification._id == action.payload._id;
        });

        if(idx >= 0) {
            let oldStatus = data[idx].status;
            data.splice(idx, 1, Object.assign({}, data[idx], action.payload.data, lodash.get(action,"payload.opts.data")));

            logger.debug("notification alert found", {
                oldStatus, notification: data[idx]
            });

            // New notification is not new anymore
            if(oldStatus == 0 && data[idx].status != 0) {
                logger.debug("new notification alert is not new anymore");
                newCount--;
            }
        }

        return {data,newCount};
    },

    notificationAlertNewCount_COMPLETED(state, action) {
        let logger = Logger.create("notificationAlertNewCount_COMPLETED");
        logger.info("enter", {state, action});

        return Object.assign({}, state, {
            newCount: action.payload
        });
    },

    notificationAlertFind_COMPLETED(state, action) {
        let logger = Logger.create("notificationAlertFind_COMPLETED");
        logger.info("enter", {state, action});

        return Object.assign({}, state, {
            data: action.payload.data
        });
    },

    signinPageOpened() {
        let logger = Logger.create("signinPageOpened");
        logger.info("enter");

        return {
            data: null,
            newCount: 0
        };
    }
}, initialState);
