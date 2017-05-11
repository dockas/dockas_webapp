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

        logger.debug("Api orderFind success", findResponse);

        return {data: findResponse.results, query};
    },

    async orderStatusUpdate(id, status, opts) {
        var logger = Logger.create("orderStatusUpdate");
        logger.info("enter", {id, status});

        let response = await Api.shared.orderStatusUpdate(id, status, opts);

        logger.debug("Api orderStatusUpdate success", response);

        return response.result;
    },

    orderStatusUpdatedEvent(data) {
        var logger = Logger.create("orderStatusUpdatedEvent");
        logger.info("enter", data);

        return data;
    }
});
