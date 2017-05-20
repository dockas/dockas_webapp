import lodash from "lodash";
import config from "config";
import {LoggerFactory,Redux} from "darch/src/utils";

let Logger = new LoggerFactory("policies.can_checkout");

module.exports = function(nextState, replace) {
    let logger = Logger.create("policy"),
        basket = lodash.get(Redux.shared.store.getState(), "basket"),
        {totalPrice} = basket,
        {minOrderTotalPrice} = config.shared,
        priceLowerThanMin = (totalPrice < minOrderTotalPrice);

    logger.info("enter", {totalPrice,minOrderTotalPrice,priceLowerThanMin});

    if(priceLowerThanMin || !lodash.size(basket.items)) {
        replace("/");
    }
    else { logger.info("pass"); }

    return Promise.resolve();
};