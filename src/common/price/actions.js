//import lodash from "lodash";
import {createActions} from "redux-actions";
import {LoggerFactory} from "darch/src/utils";
import Api from "../utils/api";

let Logger = new LoggerFactory("common.price.actions");

export default createActions({
    async priceFind(query, {
        scope="",
        concat=false,
        opts=null
    }) {
        var logger = Logger.create("priceFind");
        logger.info("enter", {query,scope,concat,opts});

        let response = await Api.shared.priceFind(query, opts);
        logger.debug("api priceFind success", response);

        return {data: response.results, query, scope, concat};
    }
});
