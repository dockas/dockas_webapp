import lodash from "lodash"
import {createActions} from "redux-actions"
import {LoggerFactory} from "darch/src/utils"
import Api from "../utils/api"

let Logger = new LoggerFactory("common.notification.actions")

export default createActions({
    notificationAlertCreatedEvent(data) {
        var logger = Logger.create("notificationAlertCreatedEvent")
        logger.info("enter", data)

        return data
    },

    notificationAlertUpdatedEvent(data) {
        var logger = Logger.create("notificationAlertUpdatedEvent")
        logger.info("enter", data)

        let {result, updatedKeys} = data
        data = lodash.pick(result, updatedKeys)

        return {data, _id: result._id}
    },

    async notificationAlertNewCount(opts) {
        var logger = Logger.create("notificationAlertNewCount")
        logger.info("enter")

        let response = await Api.shared.notificationAlertCount({
            status: [0]
        }, opts)

        logger.debug("api notificationAlertNewCount success", response)

        return response.result
    },

    async notificationAlertFind(query = {}, opts) {
        var logger = Logger.create("notificationAlertFind")
        logger.info("enter", query)

        let findResponse = await Api.shared.notificationAlertFind(query, opts)

        logger.debug("api notificationAlertFind success", findResponse)

        return {data: findResponse.results, query}
    },

    async notificationAlertUpdate(id, data = {}, opts) {
        var logger = Logger.create("notificationAlertUpdate")
        logger.info("enter", {id, data})

        let response = await Api.shared.notificationAlertUpdate(id, data, opts)

        logger.debug("api notificationAlertUpdate success", response)

        return response.result
    }
})
