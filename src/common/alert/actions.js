import {createActions} from "redux-actions";
import {LoggerFactory} from "darch/src/utils";
import Api from "../utils/api";

let Logger = new LoggerFactory("common.alert.actions");

export default createActions({
    alertCreatedEvent(data) {
        var logger = Logger.create("alertCreatedEvent");
        logger.info("enter", data);

        return data;
    },

    alertUpdatedEvent(data) {
        var logger = Logger.create("alertUpdatedEvent");
        logger.info("enter", data);

        return data;
    },

    async alertNewCount(opts) {
        var logger = Logger.create("alertNewCount");
        logger.info("enter");

        let response = await Api.shared.alertCount({
            status: ["new"]
        }, opts);

        logger.debug("Api alertNewCount success", response);

        return response.result;
    },

    async alertFind(query = {}, opts) {
        var logger = Logger.create("alertFind");
        logger.info("enter", query);

        let findResponse = await Api.shared.alertFind(query, opts);

        logger.debug("Api alertFind success", findResponse);

        return {data: findResponse.results, query};
    },

    async alertUpdate(data = {}, opts) {
        var logger = Logger.create("alertUpdate");
        logger.info("enter", data);

        let response = await Api.shared.alertUpdate(data, opts);

        logger.debug("Api alertUpdate success", response);

        return response.result;
    }
});
