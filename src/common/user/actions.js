import {createActions} from "redux-actions";
import {LoggerFactory} from "darch/src";
import Api from "../utils/api";
//import Socket from "../utils/socket";

let Logger = new LoggerFactory("common.user.actions", {level:"debug"});

export default createActions({
    async userInit() {
        var logger = Logger.create("userInit");
        logger.info("enter");

        let signedResponse = await Api.shared.signed();
        logger.debug("Api signed success", {signedResponse});

        if(signedResponse.result.ok) {
            let userMeResponse = await Api.shared.userMe();
            logger.debug("Api userMe success", {userMeResponse});

            //let authToken = await Api.shared.http.getAuthToken();
            //Socket.shared.sign(authToken);

            return userMeResponse.result;
        }
    },

    async userUpdate(profile, opts) {
        var logger = Logger.create("userUpdate");
        logger.info("enter", profile);

        let updateResponse = await Api.shared.userUpdate(profile, opts);
        logger.debug("Api userUpdate success", updateResponse);

        return profile;
    },

    async userFind(query, opts) {
        var logger = Logger.create("userFind");
        logger.info("enter", query);

        let findResponse = await Api.shared.userFind(query, opts);
        logger.debug("Api userFind success", findResponse);

        return findResponse.results;
    }
});
