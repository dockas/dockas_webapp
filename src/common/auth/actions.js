import {createActions} from "redux-actions";
import {LoggerFactory,Redux} from "darch/src";
import Api from "../utils/api";
import Socket from "../utils/socket";
import AlertActions from "../alert/actions";

let Logger = new LoggerFactory("common.auth.actions", {level:"error"});

export default createActions({
    async signin({email, password} = {}, opts) {
        var logger = Logger.create("signin");
        logger.info("enter", {email, password});

        let signinResponse = await Api.shared.signin({
            email, password
        }, opts);

        logger.debug("Api signin success", signinResponse);

        // Set api http auth token
        await Api.shared.http.setAuthToken(signinResponse.result);
        logger.debug("Api http setAuthToken success");

        // Sign socket
        Socket.shared.sign(signinResponse.result);

        // Get user new alerts count
        await Redux.dispatch(
            AlertActions.alertNewCount()
        );

        // Get user profile.
        let userMeResponse = await Api.shared.userMe(opts);
        logger.debug("Api userMe success", {userMeResponse});

        return userMeResponse.result;
    }
});
