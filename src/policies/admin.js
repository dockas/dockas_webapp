import lodash from "lodash"
import {LoggerFactory,Redux} from "darch/src/utils"

let Logger = new LoggerFactory("policies.admin")

module.exports = function(history) {
    let logger = Logger.create("policy"),
        uid = lodash.get(Redux.shared.store.getState(), "user.uid")

    logger.info("enter", {uid})

    if(!uid) {
        logger.info("not pass")

        if(history) { history.replace("/") }

        throw new Error("not admin")
    }
    else {
        let user = lodash.get(Redux.shared.store.getState(), `user.data.${uid}`)

        if(user.roles.indexOf("admin") < 0) {
            if(history) { history.replace("/") }

            throw new Error("not admin")
        }
        else {
            logger.info("pass")
        }
    }

    return Promise.resolve()
}