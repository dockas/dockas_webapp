import Socket from "../utils/socket"
import {LoggerFactory,Redux} from "darch/src/utils"

let Logger = new LoggerFactory("order_item", {level: "debug"})

module.exports = class OrderItem {
    static actions = require("./actions");
    static reducer = require("./reducer");
    static types = require("./types");
    static populator = require("./populator");

    // Register to socket events.
    static listenSocketEvents() {
        Socket.shared.on("order_item:updated", (data) => {
            let logger = Logger.create("order_item:updated")
            logger.info("enter", data)

            Redux.dispatch(OrderItem.actions.orderItemUpdatedEvent(data))
        })
    }
}