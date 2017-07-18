import lodash from "lodash"
import {LoggerFactory,Redux} from "darch/src/utils"

let Logger = new LoggerFactory("policies.basket_has_items")

module.exports = function(history) {
    let logger = Logger.create("policy"),
        basket = lodash.get(Redux.shared.store.getState(), "basket")

    logger.info("enter", {basket})

    if(!lodash.size(basket.items)) {
        if(history){ history.replace("/") }
    }
    else { logger.info("pass") }

    return Promise.resolve()
}