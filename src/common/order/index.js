import Socket from "../utils/socket";
import {LoggerFactory,Redux} from "darch/src/utils";

let Logger = new LoggerFactory("order", {level: "debug"});

module.exports = class Order {
    static actions = require("./actions");
    static reducer = require("./reducer");

    // Register to socket events.
    static listenSocketEvents() {
        Socket.shared.on("order:status_updated", (data) => {
            let logger = Logger.create("order:status_updated");
            logger.info("enter", data);

            Redux.dispatch(Order.actions.orderStatusUpdatedEvent(data));
        });
    }
};