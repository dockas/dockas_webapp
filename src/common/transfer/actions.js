import {createActions} from "redux-actions"
//import lodash from "lodash";
import {LoggerFactory} from "darch/src/utils"
import Api from "../utils/api"
//import Socket from "../utils/socket";

let Logger = new LoggerFactory("common.transfer.actions")

export default createActions({
    async brandTransfersFind(id, query, {
        scope=null, 
        concat=false,
        opts=null
    }={}) {
        let logger = Logger.create("brandTransfersFind")
        logger.info("enter", {id,query,scope,concat})

        let response = await Api.shared.brandTransfersFind(id, query, opts)
        logger.debug("api brandTransfersFind success", response)

        // Async populate results.
        //Populator.populate(response.results, populate);

        return {data: response.results, query, scope, concat}
    }
})
