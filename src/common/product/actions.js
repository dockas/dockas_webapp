//import lodash from "lodash";
import {createActions} from "redux-actions";
import {LoggerFactory,Redux} from "darch/src/utils";
import Toaster from "darch/src/toaster";
import Api from "../utils/api";
import Populator from "./populator";
//import Socket from "../utils/socket";

let Logger = new LoggerFactory("common.product.actions");

// Export actions.
export default createActions({
    productAdd(product) {
        return product;
    },

    async productCreate(data, opts) {
        var logger = Logger.create("productCreate");
        logger.info("enter", data);

        let response = await Api.shared.productCreate(data, opts);

        logger.debug("Api productCreate success", response);

        Redux.dispatch(
            Toaster.actions.push("success", "_PRODUCT_CREATE_SUCCESS_")
        );

        return response.result;
    },

    async productFind(query, {
        scope=null, 
        concat=false,
        populate={},
        opts=null
    }={}) {
        let logger = Logger.create("productFind");
        logger.info("enter", {query,scope,concat});

        let response = await Api.shared.productFind(query, opts);
        logger.debug("api productFind success", response);

        // Async populate results.
        Populator.populate(response.results, populate);

        return {data: response.results, query, scope, concat};
    },

    async productFindByNameId(nameId, {
        populate={},
        opts=null
    }={}) {
        let logger = Logger.create("productFindByNameId");
        logger.info("enter", {nameId,populate});

        let response = await Api.shared.productFindByNameId(nameId, opts);
        logger.debug("api productFindByNameId success", response);

        // Async populate results.
        Populator.populate([response.result], populate);

        return {data: response.result, nameId};
    },

    async productUpdate(id, data, {
        opts=null
    }={}) {
        let logger = Logger.create("productUpdate");
        logger.info("enter", {id, data});

        let response = await Api.shared.productUpdate(id, data, opts);

        logger.debug("api productUpdate success", response);

        Redux.dispatch(
            Toaster.actions.push("success", "_PRODUCT_UPDATE_SUCCESS_")
        );

        return {data: response.result, _id: id};
    },

    async productPriceUpdate(id, data, {
        opts=null
    }={}) {
        var logger = Logger.create("productPriceUpdate");
        logger.info("enter", {id, data});

        let response = await Api.shared.productPriceUpdate(id, data, opts);

        logger.debug("api productPriceUpdate success", response);

        Redux.dispatch(
            Toaster.actions.push("success", "_PRODUCT_UPDATE_SUCCESS_")
        );

        return {
            _id: id,
            value: data.value
        };
    },

    async productStatusUpdate(id, status, {
        opts=null
    }={}) {
        var logger = Logger.create("productStatusUpdate");
        logger.info("enter", {id, status});

        let response = await Api.shared.productStatusUpdate(id, {status}, opts);

        logger.debug("api productStatusUpdate success", response);

        Redux.dispatch(
            Toaster.actions.push("success", "_PRODUCT_UPDATE_SUCCESS_")
        );

        return {
            _id: id,
            status
        };
    },

    /**
     * This function handles product updated event.
     */
    async productUpdatedEvent(data) {
        let logger = Logger.create("productUpdatedEvent");
        logger.info("enter", {data});

        let {result, updatedKeys} = data;

        logger.debug("updated data", data);

        // Async populate results.
        Populator.populate([result], updatedKeys);
    
        // @TODO : If price has changed, then notify user
        // about that.
        if(updatedKeys.indexOf("priceValue") >= 0) {
            logger.debug("price updated");
        }

        return {data: result, _id: result._id};
    }
});
