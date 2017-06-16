/* global mixpanel */

import {createActions} from "redux-actions";
import {LoggerFactory, Storage} from "darch/src/utils";
//import Toaster from "darch/src/toaster";
import Api from "../utils/api";
//import Socket from "../utils/socket";


let Logger = new LoggerFactory("common.basket.actions");

export default createActions({
    async basketInit() {
        let storage = new Storage();

        let state = await storage.get("basket");

        return state ? JSON.parse(state) : null;
    },

    basketSetIsPaying(isPaying) {
        var logger = Logger.create("basketSetIsPaying");
        logger.info("enter", {isPaying});

        return {isPaying};
    },

    basketAddProduct(product) {
        var logger = Logger.create("basketAddProduct");
        logger.info("enter", product);

        mixpanel.track("basket product added", {
            product: product.nameId
        });

        return product;
    },

    basketRemoveProduct(product) {
        var logger = Logger.create("basketRemoveProduct");
        logger.info("enter", product);

        mixpanel.track("basket product removed", {
            product: product.nameId
        });

        return product;
    },

    basketLoadList(list) {
        var logger = Logger.create("basketLoadList");
        logger.info("enter", {list});

        return list;
    },

    async basketApplyCoupon(couponNameId, opts) {
        var logger = Logger.create("basketApplyCoupon");
        logger.info("enter", {couponNameId});

        let response = await Api.shared.couponApplyByNameId(couponNameId, opts);

        logger.debug("Api couponApplyByNameId success", response);

        return response.result;
    },

    basketSelectAddress(address) {
        var logger = Logger.create("basketSelectAddress");
        logger.info("enter", address);

        return address;
    },

    basketClear() {
        var logger = Logger.create("basketClear");
        logger.info("enter");
    }
});
