import lodash from "lodash";
import {LoggerFactory,Redux} from "darch/src/utils";

let Logger = new LoggerFactory("policies.not_auth");

module.exports = function(nextState, replace) {
    let logger = Logger.create("policy"),
        uid = lodash.get(Redux.shared.store.getState(), "user.uid");

    logger.info("enter", {uid});

    if(!uid) {
        logger.info("not pass");
        replace("/signin");
    }
    else {logger.info("pass");}

    return Promise.resolve();
};