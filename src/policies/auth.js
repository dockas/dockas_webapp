import lodash from "lodash"
import qs from "qs"
import {LoggerFactory,Redux} from "darch/src/utils"

let Logger = new LoggerFactory("policies.not_auth")

module.exports = function(history, location) {
    let logger = Logger.create("policy"),
        uid = lodash.get(Redux.shared.store.getState(), "user.uid")

    logger.info("enter", {uid})

    let pathname = "/signin"

    if(location && location.pathname) {
        let queryStr = qs.stringify({
            redirect: location.pathname
        })

        pathname = `${pathname}?${queryStr}`
    }

    if(!uid) {
        logger.info("not pass")
        
        if(history) {
            history.replace(pathname)
        }

        throw new Error("not authenticated")
    }
    else {logger.info("pass")}

    return Promise.resolve()
}