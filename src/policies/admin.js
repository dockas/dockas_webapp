import lodash from "lodash";
import {LoggerFactory,Redux} from "darch/src/utils";

let Logger = new LoggerFactory("policies.admin");

module.exports = function(nextState, replace) {
    let logger = Logger.create("policy"),
        uid = lodash.get(Redux.shared.store.getState(), "user.uid");

    logger.info("enter", {uid});

    if(!uid) {
        logger.info("not pass");
        replace("/");
    }
    else {
        let user = lodash.get(Redux.shared.store.getState(), `user.profiles.${uid}`);

        if(user.role != "admin") {
            replace("/");
        }
        else {
            logger.info("pass");
        }
    }

    return Promise.resolve();
};