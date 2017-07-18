import {createActions} from "redux-actions"
import lodash from "lodash"
import {LoggerFactory,Redux} from "darch/src"
import Api from "../utils/api"
import Socket from "../utils/socket"
import Tracker from "../utils/tracker"
import NotificationAlertActions from "../notification_alert/actions"

let Logger = new LoggerFactory("common.user.actions", {level:"debug"})

export default createActions({
    async userInit() {
        var logger = Logger.create("userInit")
        logger.info("enter")

        let response = await Api.shared.signed()
        logger.debug("api signed success", {response})

        if(response.result.ok) {
            response = await Api.shared.userMe()
            logger.debug("Api userMe success", {response})

            // Track
            Tracker.identify(response.result)

            let authToken = await Api.shared.http.getAuthToken()
            //console.log("auth token", authToken);
            Socket.shared.sign(authToken)

            // Count new alerts.
            await Redux.dispatch(
                NotificationAlertActions.notificationAlertNewCount()
            )

            // Return user profile
            return response.result
        }
    },

    async userUpdateMe(data, opts) {
        var logger = Logger.create("userUpdateMe")
        logger.info("enter", data)

        let response = await Api.shared.userUpdateMe(data, opts)
        logger.debug("api userUpdateMe success", response)

        return {data: response.result, _id: lodash.get(response, "result._id")}
    },

    async userUpdate(uid, data, opts) {
        var logger = Logger.create("userUpdate")
        logger.info("enter", data)

        let response = await Api.shared.userUpdate(uid, data, opts)
        logger.debug("api userUpdate success", response)

        return {data: response.result, _id: lodash.get(response, "result._id")}
    },

    async userAddAddress(address, opts) {
        var logger = Logger.create("userAddAddress")
        logger.info("enter", address)

        let response = await Api.shared.userAddAddress(address, opts)
        logger.debug("Api userAddAddress success", response)

        return {data: response.result, _id: lodash.get(response, "result._id")}
    },

    async userRemoveAddress(id, opts) {
        var logger = Logger.create("userRemoveAddress")
        logger.info("enter", id)

        let response = await Api.shared.userRemoveAddress(id, opts)
        logger.debug("Api userRemoveAddress success", response)

        return id
    },

    async userAddBillingSource(source, opts) {
        var logger = Logger.create("userAddBillingSource")
        logger.info("enter", source)

        let response = await Api.shared.billingSourceAdd(source, opts)
        logger.debug("Api billingSourceAdd success", response)

        return response.result
    },

    async userRemoveBillingSource(id, opts) {
        var logger = Logger.create("userRemoveBillingSource")
        logger.info("enter", {id})

        let response = await Api.shared.billingSourceRemove(id, opts)
        logger.debug("Api billingSourceRemove success", response)

        return {_id: id}
    },

    async userFind(query, {
        scope=null, 
        concat=false,
        opts=null
    }={}) {
        let logger = Logger.create("userFind")
        logger.info("enter", {query,scope,concat})

        let response = await Api.shared.userFind(query, opts)
        logger.debug("api userFind success", response)

        // Async populate results.
        //Populator.populate(response.results, populate);

        return {data: response.results, query, scope, concat}
    },

    async userUpdatedEvent(data) {
        let logger = Logger.create("userUpdatedEvent")
        logger.info("enter", {data})

        let {result} = data
        logger.debug("updated data", data)

        return {data: result, _id: result._id}
    }
})
