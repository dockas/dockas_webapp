import {createActions} from "redux-actions";
import {LoggerFactory} from "darch/src/utils";
import Api from "../utils/api";

let Logger = new LoggerFactory("common.order.actions");

export default createActions({
    async orderCreate(data, opts) {
        var logger = Logger.create("orderCreate");
        logger.info("enter", data);

        let createResponse = await Api.shared.orderCreate(data, opts);

        logger.debug("Api orderCreate success", createResponse);

        return createResponse.result;
    },

    async orderFind(query, opts) {
        var logger = Logger.create("orderFind");
        logger.info("enter", query);

        let findResponse = await Api.shared.orderFind(query, opts);

        logger.debug("Api orderCreate success", findResponse);

        return {data: findResponse.results, query};
    }
});
