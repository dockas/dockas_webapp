//import lodash from "lodash";
import {createActions} from "redux-actions"
import {LoggerFactory} from "darch/src/utils"
import Api from "../utils/api"
import Populator from "./populator"

let Logger = new LoggerFactory("common.order.actions")

export default createActions({
    async orderCreate(data, opts) {
        var logger = Logger.create("orderCreate")
        logger.info("enter", data)

        let response = await Api.shared.orderCreate(data, opts)

        logger.debug("Api orderCreate success", response)

        return response.result
    },

    async orderFind(query, {
        scope="",
        populate={},
        concat=false,
        opts=null
    }) {
        var logger = Logger.create("orderFind")
        logger.info("enter", {query,scope,concat,opts})

        let response = await Api.shared.orderFind(query, opts)
        logger.debug("api orderFind success", response)

        // Async populate results.
        Populator.populate(response.results, populate)

        return {data: response.results, query, scope, concat}
    },

    async orderStatusUpdate(id, status, opts) {
        var logger = Logger.create("orderStatusUpdate")
        logger.info("enter", {id, status})

        let response = await Api.shared.orderStatusUpdate(id, status, opts)

        logger.debug("api orderStatusUpdate success", response)

        return {data: response.result, _id: response.result._id}
    },

    async orderUpdatedEvent(data) {
        let logger = Logger.create("orderUpdatedEvent")
        logger.info("enter", {data})

        let {result} = data
        logger.debug("updated data", data)

        return {data: result, _id: result._id}
    }
})
