//import lodash from "lodash";
import {createActions} from "redux-actions";
import {LoggerFactory} from "darch/src/utils";
import Api from "../utils/api";
import Populator from "./populator";

let Logger = new LoggerFactory("common.order_item.actions");

export default createActions({
    async orderItemFind(query, {
        scope="",
        populate={},
        concat=false,
        opts=null
    }={}) {
        var logger = Logger.create("orderItemFind");
        logger.info("enter", {query,scope,concat,opts});

        let response = await Api.shared.orderItemFind(query, opts);
        logger.debug("api orderItemFind success", response);

        // Async populate results.
        Populator.populate(response.results, populate);

        return {data: response.results, query, scope, concat};
    },

    async orderItemUpdate(id, data, opts) {
        var logger = Logger.create("orderItemUpdate");
        logger.info("enter", {id, data});

        let response = await Api.shared.orderItemUpdate(id, data, opts);

        logger.debug("api orderItemUpdate success", response);

        return {data: response.result, _id: response.result._id};
    },

    async orderItemStatusUpdate(id, status, opts) {
        var logger = Logger.create("orderItemStatusUpdate");
        logger.info("enter", {id, status});

        let response = await Api.shared.orderItemStatusUpdate(id, status, opts);

        logger.debug("api orderItemStatusUpdate success", response);

        return {data: response.result, _id: response.result._id};
    },

    async orderItemUpdatedEvent(data) {
        let logger = Logger.create("orderItemUpdatedEvent");
        logger.info("enter", {data});

        let {result} = data;
        logger.debug("updated data", data);

        return {data: result, _id: result._id};
    }
});
