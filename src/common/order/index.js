import Socket from "../utils/socket"
import {LoggerFactory,Redux} from "darch/src/utils"

let Logger = new LoggerFactory("order", {level: "debug"})

module.exports = class Order {
    static actions = require("./actions");
    static reducer = require("./reducer");
    static types = require("./types");
    static populator = require("./populator");

    // Register to socket events.
    static listenSocketEvents() {
        Socket.shared.on("order:updated", (data) => {
            let logger = Logger.create("order:updated")
            logger.info("enter", data)

            Redux.dispatch(Order.actions.orderUpdatedEvent(data))
        })
    }
}