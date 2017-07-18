import lodash from "lodash"
import config from "config"
import {LoggerFactory,Redux} from "darch/src/utils"

let Logger = new LoggerFactory("policies.can_checkout")

module.exports = function(history) {
    let logger = Logger.create("policy"),
        basket = lodash.get(Redux.shared.store.getState(), "basket"),
        {totalPrice} = basket,
        {minTotalPrice} = config.shared.order,
        priceLowerThanMin = (totalPrice < minTotalPrice)

    logger.info("enter", {totalPrice,minTotalPrice,priceLowerThanMin})

    if(!lodash.size(basket.items)) {
        if(history){ history.replace("/") }

        throw new Error("basket is empty")
    }
    else { logger.info("pass") }

    return Promise.resolve()
}