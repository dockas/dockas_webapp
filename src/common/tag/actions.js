//import lodash from "lodash";
import {createActions} from "redux-actions"
import {LoggerFactory} from "darch/src/utils"
import Api from "../utils/api"
import Populator from "./populator"

let Logger = new LoggerFactory("common.tag.actions")

export default createActions({
    async tagCreate(data, {
        opts=null
    }={}) {
        var logger = Logger.create("tagCreate")
        logger.info("enter", data)

        let response = await Api.shared.tagCreate(data, opts)

        logger.debug("api tagCreate success", response)

        return {data: response.result}
    },

    async tagFind(query, {
        scope="",
        populate={},
        concat=false,
        opts=null
    }={}) {
        var logger = Logger.create("tagFind")
        logger.info("enter", {query,scope,concat,opts})

        let response = await Api.shared.tagFind(query, opts)

        logger.debug("api tagFind success", response)

        // Build the dropdown version
        let dropdown = []

        for(let tag of response.results) {
            dropdown.push({
                label: tag.name,
                value: tag._id,
                color: tag.color
            })
        }

        // Async populate results.
        Populator.populate(response.results, populate)

        // Return data.
        return {data: response.results, dropdown, query, scope, concat}
    },

    async tagUpdate(id, data, {
        opts=null
    }={}) {
        let logger = Logger.create("tagUpdate")
        logger.info("enter", {id, data})

        let response = await Api.shared.tagUpdate(id, data, opts)

        logger.debug("api tagUpdate success", response)

        return {data: response.result, _id: id}
    },

    async tagCreatedEvent(data) {
        let logger = Logger.create("tagCreatedEvent")
        logger.info("enter", {data})

        let {result} = data

        return {data: result, _id: result._id}
    },

    /**
     * This function handles tag updated event.
     */
    async tagUpdatedEvent(data) {
        let logger = Logger.create("tagUpdatedEvent")
        logger.info("enter", {data})

        let {result, updatedKeys} = data
        logger.debug("updated data", data)

        // Async populate results.
        Populator.populate([result], updatedKeys)

        return {data: result, _id: result._id}
    },

    /**
     * This function handles tag updated event of multiple tags.
     */
    async tagsUpdatedEvent(data) {
        let logger = Logger.create("tagsUpdatedEvent")
        logger.info("enter", {data})

        let {result, updatedKeys} = data
        logger.debug("updated data", data)

        // Async populate results.
        Populator.populate(result, updatedKeys)

        return {data: result, _id: result._id}
    }
})
