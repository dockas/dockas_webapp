import {createActions} from "redux-actions"
import {LoggerFactory} from "darch/src/utils"
import Api from "../utils/api"
//import Socket from "../utils/socket";

let Logger = new LoggerFactory("common.file.actions")

export default createActions({
    fileAdd(file) {
        return file
    },

    async fileFind(query, {
        scope=null, 
        concat=false,
        opts=null
    }={}) {
        var logger = Logger.create("fileFind")
        logger.info("enter", {query,scope,concat})

        let response = await Api.shared.fileFind(query, opts)

        logger.debug("api fileFind success", response)

        return {data: response.results, query, scope, concat}
    }
})
