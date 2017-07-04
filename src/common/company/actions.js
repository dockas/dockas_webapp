import {createActions} from "redux-actions";
import {LoggerFactory} from "darch/src/utils";
import Api from "../utils/api";
//import Socket from "../utils/socket";

let Logger = new LoggerFactory("common.company.actions");

export default createActions({
    async companyFind(query, {
        scope=null, 
        concat=false,
        opts=null
    }={}) {
        var logger = Logger.create("companyFind");
        logger.info("enter", query);

        let response = await Api.shared.companyFind(query, opts);

        logger.debug("api companyFind success", response);

        return {data: response.results, query, scope, concat};
    }
});
