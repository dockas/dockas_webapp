import {createActions} from "redux-actions";
import {LoggerFactory,Redux} from "darch/src";
import Api from "../utils/api";
import Socket from "../utils/socket";
import Tracker from "../utils/tracker";
import NotificationAlertActions from "../notification_alert/actions";

let Logger = new LoggerFactory("common.auth.actions", {level:"error"});

export default createActions({
    signinPageOpened() {
        var logger = Logger.create("signinPageOpened");
        logger.info("enter");
    },

    async signin({email, password} = {}, opts) {
        var logger = Logger.create("signin");
        logger.info("enter", {email, password});

        let response = await Api.shared.signin({
            email, password
        }, opts);

        logger.debug("Api signin success", response);

        // Set api http auth token
        await Api.shared.http.setAuthToken(response.result);
        logger.debug("Api http setAuthToken success");

        // Sign socket
        Socket.shared.sign(response.result);

        // Get user new alerts count
        await Redux.dispatch(
            NotificationAlertActions.notificationAlertNewCount()
        );

        // Get user profile.
        response = await Api.shared.userMe(opts);
        logger.debug("Api userMe success", {response});

        // Track
        Tracker.identify(response.result);

        return response.result;
    },

    async signout() {
        var logger = Logger.create("signout");
        logger.info("enter");

        let response = await Api.shared.signout();
        logger.debug("api signout success", response);

        // Remove api http auth token
        await Api.shared.http.removeAuthToken();
        logger.debug("api http removeAuthToken success");

        return response.result;
    }
});
