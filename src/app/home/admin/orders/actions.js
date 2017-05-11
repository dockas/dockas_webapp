import {createActions} from "redux-actions";
import {LoggerFactory} from "darch/src/utils";
import {Api} from "common";

let Logger = new LoggerFactory("admin.orders.actions");

export default createActions({
    async adminOrdersFind(query, opts) {
        var logger = Logger.create("adminOrdersFind");
        logger.info("enter", query);

        let findResponse = await Api.shared.orderFind(query, opts);

        logger.debug("Api orderCreate success", findResponse);

        return {data: findResponse.results, query};
    },

    async adminOrdersFindProducts(query, opts) {
        var logger = Logger.create("adminOrdersFindProducts");
        logger.info("enter", query);

        let findResponse = await Api.shared.productFind(query, opts);

        logger.debug("Api productFind success", findResponse);

        return findResponse.results;
    },

    async adminOrdersStatusUpdate(id, status, opts) {
        var logger = Logger.create("adminOrdersUpdateStatus");
        logger.info("enter", {id, status});

        let response = await Api.shared.orderStatusUpdate(id, status, opts);

        logger.debug("Api orderStatusUpdate success", response);

        return response.result;
    }
});
