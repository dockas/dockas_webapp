import lodash from "lodash";
import {createActions} from "redux-actions";
import {LoggerFactory} from "darch/src/utils";
import Api from "../utils/api";

let Logger = new LoggerFactory("common.alert.option_actions");

export default createActions({
   
    async alertOptionActionOrderUserAvailabilityUpdate(selectedOption, alert, opts) {
        var logger = Logger.create("alertOptionActionOrderUserAvailabilityUpdate");
        logger.info("enter", selectedOption);

        // Update order with new status.
        let orderStatus = selectedOption == "yes" ? "user_available" : "user_unavailable";

        let response = await Api.shared.orderStatusUpdate(lodash.get(alert, "data.order._id"), orderStatus, opts);

        logger.debug("Api orderStatusUpdate success", response);

        return response.result;
    }
});
