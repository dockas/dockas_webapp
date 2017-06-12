import {createActions} from "redux-actions";
import lodash from "lodash";
import {LoggerFactory,Redux} from "darch/src";
import Api from "../utils/api";
import Socket from "../utils/socket";
import NotificationActions from "../notification/actions";

let Logger = new LoggerFactory("common.user.actions", {level:"debug"});

export default createActions({
    async userInit() {
        var logger = Logger.create("userInit");
        logger.info("enter");

        let response = await Api.shared.signed();
        logger.debug("api signed success", {response});

        if(response.result.ok) {
            let userMeResponse = await Api.shared.userMe();
            logger.debug("Api userMe success", {userMeResponse});

            let authToken = await Api.shared.http.getAuthToken();
            //console.log("auth token", authToken);
            Socket.shared.sign(authToken);

            // Count new alerts.
            await Redux.dispatch(
                NotificationActions.notificationNewCount()
            );

            // Return user profile
            return userMeResponse.result;
        }
    },

    async userUpdate(profile, opts) {
        var logger = Logger.create("userUpdate");
        logger.info("enter", profile);

        let updateResponse = await Api.shared.userUpdate(profile, opts);
        logger.debug("Api userUpdate success", updateResponse);

        return profile;
    },

    async userAddAddress(address, opts) {
        var logger = Logger.create("userAddAddress");
        logger.info("enter", address);

        let response = await Api.shared.userAddAddress(address, opts);
        logger.debug("Api userAddAddress success", response);

        return response.result;
    },

    async userAddBillingSource(source, opts) {
        var logger = Logger.create("userAddBillingSource");
        logger.info("enter", source);

        let response = await Api.shared.billingSourceAdd(source, opts);
        logger.debug("Api billingSourceAdd success", response);

        return response.result;
    },

    async userRemoveBillingSource(id, opts) {
        var logger = Logger.create("userRemoveBillingSource");
        logger.info("enter", {id});

        let response = await Api.shared.billingSourceRemove(id, opts);
        logger.debug("Api billingSourceRemove success", response);

        return {_id: id};
    },

    async userRemoveAddress(id, opts) {
        var logger = Logger.create("userRemoveAddress");
        logger.info("enter", id);

        let response = await Api.shared.userRemoveAddress(id, opts);
        logger.debug("Api userRemoveAddress success", response);

        return id;
    },

    async userFind(query, opts) {
        var logger = Logger.create("userFind");
        logger.info("enter", query);

        let findResponse = await Api.shared.userFind(query, opts);
        logger.debug("Api userFind success", findResponse);

        return findResponse.results;
    },

    userUpdatedEvent(data) {
        let logger = Logger.create("userUpdatedEvent");
        logger.info("enter", {data});

        let {result, updatedKeys} = data;
        data = lodash.pick(result, updatedKeys);

        logger.debug("updated data", data);

        return {data, _id: result._id};
    }
});
