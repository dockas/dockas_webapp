//import lodash from "lodash";
import {createActions} from "redux-actions"
import {LoggerFactory,Redux} from "darch/src/utils"
import Toaster from "darch/src/toaster"
import Api from "../utils/api"
//import Socket from "../utils/socket";

let Logger = new LoggerFactory("common.list_subscription.actions")

export default createActions({

    async listSubscriptionCreate(data, opts) {
        var logger = Logger.create("listSubscriptionCreate")
        logger.info("enter", data)

        let response = await Api.shared.listSubscriptionCreate(data, opts)

        logger.debug("api listSubscriptionCreate success", response)

        Redux.dispatch(
            Toaster.actions.push("success", "_LIST_SUBSCRIPTION_CREATE_SUCCESS_")
        )

        return response.result
    },

    async listSubscriptionFind(query, {
        scope=null,
        populate=[],
        concat=false,
        opts=null
    }={}) {
        var logger = Logger.create("listSubscriptionFind")
        logger.info("enter", {query,scope,populate,concat})

        let response = await Api.shared.listSubscriptionFind(query, opts)

        logger.debug("api listSubscriptionFind success", response)

        return {data: response.results, query, scope, populate, concat}
    },

    async listSubscriptionUpdate(id, data, {opts=null}={}) {
        let logger = Logger.create("listSubscriptionUpdate")
        logger.info("enter", {id, data})

        let response = await Api.shared.listSubscriptionUpdate(id, data, opts)

        logger.debug("api listSubscriptionUpdate success", response)

        Redux.dispatch(
            Toaster.actions.push("success", "_LIST_SUBSCRIPTION_UPDATE_SUCCESS_")
        )

        return {data: response.result, _id: id}
    },

    /**
     * This function handles list updated event.
     */
    async listSubscriptionUpdatedEvent(data) {
        let logger = Logger.create("listSubscriptionUpdatedEvent")
        logger.info("enter", {data})

        let {result} = data

        logger.debug("updated data", data)

        return {data: result, _id: result._id}
    }
})
