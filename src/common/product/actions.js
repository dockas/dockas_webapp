import lodash from "lodash";
import {createActions} from "redux-actions";
import {LoggerFactory,Redux} from "darch/src/utils";
import Toaster from "darch/src/toaster";
import Api from "../utils/api";
//import Socket from "../utils/socket";

let Logger = new LoggerFactory("common.product.actions");

export default createActions({
    productSelect(product) {
        var logger = Logger.create("productSelect");
        logger.info("enter", product);

        return product;
    },

    async productCreate(data, opts) {
        var logger = Logger.create("productCreate");
        logger.info("enter", data);

        let createResponse = await Api.shared.productCreate(data, opts);

        logger.debug("Api productCreate success", createResponse);

        Redux.dispatch(
            Toaster.actions.push("success", "_PRODUCT_CREATE_SUCCESS_")
        );

        return createResponse.result;
    },

    async productFind(query, {
        scope=null, 
        concat=false,
        opts=null
    }={}) {
        var logger = Logger.create("productFind");
        logger.info("enter", {query,scope,concat});

        let response = await Api.shared.productFind(query, opts);

        logger.debug("api productFind success", response);

        return {data: response.results, query, scope, concat};
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
        data = lodash.pick(result, updatedKeys);

        logger.debug("updated data", data);

        // @TODO : If any profile images has changed, then we must
        // populate it.
        if(updatedKeys.indexOf("profileImages") >= 0) {
            try {
                let response = await Api.shared.fileFind({
                    _id: data.profileImages
                });

                data.profileImages = response.results;

                console.log("balofo colo : new profile images", data.profileImages);

                logger.debug("api fileFind success", response);
            }
            catch(error) {
                logger.error("api fileFind error", error);
                delete data.profileImages;
            }
        }
        
        // @TODO : If any tags has changed, then we must
        // populate it.

        // @TODO : If price has changed, then notify user
        // about that.
        if(updatedKeys.indexOf("priceValue") >= 0) {
            logger.debug("price updated");
        }

        return {data, _id: result._id};
    }
});
