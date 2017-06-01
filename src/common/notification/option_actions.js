import lodash from "lodash";
import {createActions} from "redux-actions";
import {LoggerFactory} from "darch/src/utils";
import Api from "../utils/api";

let Logger = new LoggerFactory("common.notification.option_actions");

export default createActions({
   
    async notificationOptionActionOrderUserAvailabilityUpdate(selectedOption, notification, opts) {
        var logger = Logger.create("notificationOptionActionOrderUserAvailabilityUpdate");
        logger.info("enter", selectedOption);

        // Update order with new status.
        let orderStatus = selectedOption == "yes" ? "user_available" : "user_unavailable";

        let response = await Api.shared.orderStatusUpdate(lodash.get(notification, "data.order._id"), orderStatus, opts);

        logger.debug("api orderStatusUpdate success", response);

        return response.result;
    }
});
