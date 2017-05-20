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

    async productFind(query, opts={}) {
        var logger = Logger.create("productFind");
        logger.info("enter", query);

        let findResponse = await Api.shared.productFind(query, opts.reqOpts);

        logger.debug("Api productCreate success", findResponse);

        return {data: findResponse.results, query, opts};
    },

    async productUpdate(id, data, opts={}) {
        var logger = Logger.create("productUpdate");
        logger.info("enter", {id, data});

        let updateResponse = await Api.shared.productUpdate(id, data, opts.reqOpts);

        logger.debug("Api productUpdate success", updateResponse);

        Redux.dispatch(
            Toaster.actions.push("success", "_PRODUCT_UPDATE_SUCCESS_")
        );

        return {data: updateResponse.result, opts};
    },
});
