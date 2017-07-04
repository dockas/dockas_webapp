import {createActions} from "redux-actions";
import {LoggerFactory,Redux} from "darch/src/utils";
import Toaster from "darch/src/toaster";
import Api from "../utils/api";
import Populator from "./populator";
//import Socket from "../utils/socket";

let Logger = new LoggerFactory("common.brand.actions");

export default createActions({
    brandAdd(brand) {
        return brand;
    },

    async brandCreate(data, opts) {
        var logger = Logger.create("brandCreate");
        logger.info("enter", data);

        let response = await Api.shared.brandCreate(data, opts);

        logger.debug("api brandCreate success", response);

        Redux.dispatch(
            Toaster.actions.push("success", "_BRAND_CREATE_SUCCESS_")
        );

        return response.result;
    },

    async brandFind(query, {
        scope=null, 
        concat=false,
        populate={},
        opts=null
    }={}) {
        var logger = Logger.create("brandFind");
        logger.info("enter", query);

        let response = await Api.shared.brandFind(query, opts);
        logger.debug("api brandFind success", response);

        // Async populate results.
        Populator.populate(response.results, populate);

        return {data: response.results, query, scope, concat};
    },

    async brandFindByNameId(nameId, {
        populate={},
        opts=null
    }={}) {
        let logger = Logger.create("brandFindByNameId");
        logger.info("enter", {nameId,populate});

        let response = await Api.shared.brandFindByNameId(nameId, opts);
        logger.debug("api brandFindByNameId success", response);

        // Async populate results.
        Populator.populate([response.result], populate);

        return {data: response.result, nameId};
    },

    async brandUpdate(id, data, opts) {
        var logger = Logger.create("brandUpdate");
        logger.info("enter", {id, data});

        let updateResponse = await Api.shared.brandUpdate(id, data, opts);

        logger.debug("api brandUpdate success", updateResponse);

        Redux.dispatch(
            Toaster.actions.push("success", "_BRAND_UPDATE_SUCCESS_")
        );

        return updateResponse.result;
    },

    /**
     * This function handles product updated event.
     */
    async brandUpdatedEvent(data) {
        let logger = Logger.create("brandUpdatedEvent");
        logger.info("enter", {data});

        let {result, updatedKeys} = data;

        logger.debug("updated data", data);

        // Async populate results.
        Populator.populate([result], updatedKeys);

        return {data: result, _id: result._id};
    }
});
