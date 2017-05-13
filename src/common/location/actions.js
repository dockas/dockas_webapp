import {createActions} from "redux-actions";
import {LoggerFactory} from "darch/src/utils";


let Logger = new LoggerFactory("common.location.actions");

export default createActions({
    locationChange(data) {
        var logger = Logger.create("locationChange");
        logger.info("enter", data);
    }
});
