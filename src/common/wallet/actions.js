import {createActions} from "redux-actions";
//import lodash from "lodash";
import {LoggerFactory} from "darch/src/utils";
import Api from "../utils/api";
//import Socket from "../utils/socket";

let Logger = new LoggerFactory("common.wallet.actions");

export default createActions({
    async brandWalletFind(id, {
        opts=null
    }={}) {
        let logger = Logger.create("brandWalletFind");
        logger.info("enter", {id});

        let response = await Api.shared.brandWalletFind(id, opts);
        logger.debug("api brandWalletFind success", response);

        // Async populate results.
        //Populator.populate(response.results, populate);

        return response.result;
    },

    async walletFindById(id, {
        opts=null
    }={}) {
        let logger = Logger.create("walletFindById");
        logger.info("enter", {id});

        let response = await Api.shared.walletFindById(id, opts);
        logger.debug("api walletFindById success", response);

        // Async populate results.
        //Populator.populate([response.result], populate);

        return response.result;
    },

    /**
     * This function handles product updated event.
     */
    async walletUpdatedEvent(data) {
        let logger = Logger.create("walletUpdatedEvent");
        logger.info("enter", {data});

        let {result} = data;
        logger.debug("updated data", data);

        return {data: result, _id: result._id};
    }
});
