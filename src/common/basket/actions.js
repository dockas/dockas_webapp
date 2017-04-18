import {createActions} from "redux-actions";
import {LoggerFactory, Storage} from "darch/src/utils";
//import Toaster from "darch/src/toaster";
//import Api from "../utils/api";
//import Socket from "../utils/socket";


let Logger = new LoggerFactory("common.basket.actions");

export default createActions({
    async basketInit() {
        let storage = new Storage();

        let state = await storage.get("basket");

        return state ? JSON.parse(state) : null;
    },

    basketAddProduct(product) {
        var logger = Logger.create("basketAddProduct");
        logger.info("enter", product);

        return product;
    },

    basketRemoveProduct(product) {
        var logger = Logger.create("basketRemoveProduct");
        logger.info("enter", product);

        return product;
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
