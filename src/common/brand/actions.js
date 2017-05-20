import {createActions} from "redux-actions";
import {LoggerFactory,Redux} from "darch/src/utils";
import Toaster from "darch/src/toaster";
import Api from "../utils/api";
//import Socket from "../utils/socket";

let Logger = new LoggerFactory("common.brand.actions");

export default createActions({
    brandSelect(brand) {
        var logger = Logger.create("brandSelect");
        logger.info("enter", brand);

        return brand;
    },

    async brandFind(query, opts) {
        var logger = Logger.create("brandFind");
        logger.info("enter", query);

        let findResponse = await Api.shared.brandFind(query, opts);

        logger.debug("api brandFind success", findResponse);

        return {data: findResponse.results, query};
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
});
