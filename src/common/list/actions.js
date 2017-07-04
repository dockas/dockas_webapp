//import lodash from "lodash";
import {createActions} from "redux-actions";
import {LoggerFactory,Redux} from "darch/src/utils";
import Toaster from "darch/src/toaster";
import Api from "../utils/api";
import Populator from "./populator";
//import Socket from "../utils/socket";

let Logger = new LoggerFactory("common.list.actions");

export default createActions({
    async listCreate(data, opts) {
        var logger = Logger.create("listCreate");
        logger.info("enter", data);

        let response = await Api.shared.listCreate(data, opts);

        logger.debug("api listCreate success", response);

        Redux.dispatch(
            Toaster.actions.push("success", "_LIST_CREATE_SUCCESS_")
        );

        return response.result;
    },

    async listFind(query, {
        scope=null,
        populate={},
        concat=false,
        opts=null
    }={}) {
        var logger = Logger.create("listFind");
        logger.info("enter", {query,scope,populate,concat});

        let response = await Api.shared.listFind(query, opts);
        logger.debug("api listFind success", response);

        // Async populate results.
        Populator.populate(response.results, populate);

        return {data: response.results, query, scope, concat};
    },

    async listFindByNameId(nameId, query, {
        populate={},
        opts=null
    }={}) {
        var logger = Logger.create("listFindByNameId");
        logger.info("enter", {nameId,query});

        let response = await Api.shared.listFindByNameId(nameId, query, opts);
        logger.debug("api listFindByNameId success", response);

        // Async populate results.
        Populator.populate([response.result], populate);

        return {data: response.result};
    },

    async listUpdate(id, data, {
        preventToaster=false,
        opts=null
    }={}) {
        let logger = Logger.create("listUpdate");
        logger.info("enter", {id, data});

        let response = await Api.shared.listUpdate(id, data, opts);

        logger.debug("api listUpdate success", response);

        if(!preventToaster) {
            Redux.dispatch(
                Toaster.actions.push("success", "_LIST_UPDATE_SUCCESS_")
            );
        }

        return {data: response.result, _id: id};
    },

    async listItemUpdate(id, productId, data, {opts={}}={}) {
        let logger = Logger.create("listItemUpdate");
        logger.info("enter", {id, productId, data});

        let response = await Api.shared.listItemUpdate(
            id, 
            productId, 
            data,
            opts
        );

        logger.debug("api listItemUpdate success", response);

        return {data: response.result, _id: id};
    },

    /**
     * This function handles list updated event.
     */
    async listUpdatedEvent(data) {
        let logger = Logger.create("listUpdatedEvent");
        logger.info("enter", {data});

        let {result, updatedKeys} = data;

        logger.debug("updated data", data);

        // Async populate results.
        Populator.populate([result], updatedKeys);

        return {data: result, _id: result._id};
    }
});
