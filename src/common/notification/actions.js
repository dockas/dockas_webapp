import {createActions} from "redux-actions";
import {LoggerFactory} from "darch/src/utils";
import Api from "../utils/api";

let Logger = new LoggerFactory("common.notification.actions");

export default createActions({
    notificationCreatedEvent(data) {
        var logger = Logger.create("notificationCreatedEvent");
        logger.info("enter", data);

        return data;
    },

    notificationUpdatedEvent(data) {
        var logger = Logger.create("notificationUpdatedEvent");
        logger.info("enter", data);

        return data;
    },

    async notificationNewCount(opts) {
        var logger = Logger.create("notificationNewCount");
        logger.info("enter");

        let response = await Api.shared.notificationCount({
            status: [0]
        }, opts);

        logger.debug("api notificationNewCount success", response);

        return response.result;
    },

    async notificationFind(query = {}, opts) {
        var logger = Logger.create("notificationFind");
        logger.info("enter", query);

        let findResponse = await Api.shared.notificationFind(query, opts);

        logger.debug("api notificationFind success", findResponse);

        return {data: findResponse.results, query};
    },

    async notificationUpdate(data = {}, opts) {
        var logger = Logger.create("notificationUpdate");
        logger.info("enter", data);

        let response = await Api.shared.notificationUpdate(data, opts);

        logger.debug("api notificationUpdate success", response);

        return response.result;
    }
});
