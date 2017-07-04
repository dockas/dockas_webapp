import lodash from "lodash";
import config from "config";
import {LoggerFactory,Redux} from "darch/src/utils";

let Logger = new LoggerFactory("policies.can_checkout");

module.exports = function(nextState, replace) {
    let logger = Logger.create("policy"),
        basket = lodash.get(Redux.shared.store.getState(), "basket"),
        //{uid,data} = lodash.get(Redux.shared.store.getState(), "user"),
        //user = uid?data[uid]:null,
        //isAdmin = user?user.roles.indexOf("admin")>=0:false,
        {totalPrice} = basket,
        {minTotalPrice} = config.shared.order,
        priceLowerThanMin = (totalPrice < minTotalPrice);

    logger.info("enter", {totalPrice,minTotalPrice,priceLowerThanMin});

    if(!lodash.size(basket.items)) {
        replace("/");
    }
    else { logger.info("pass"); }

    return Promise.resolve();
};