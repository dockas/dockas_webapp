//import Socket from "../utils/socket";
//import {LoggerFactory,Redux} from "darch/src/utils";

//let Logger = new LoggerFactory("order_item", {level: "debug"});

module.exports = class OrderItem {
    static actions = require("./actions");
    static reducer = require("./reducer");

    // Register to socket events.
    /*static listenSocketEvents() {
        Socket.shared.on("price:created", (data) => {
            let logger = Logger.create("price:created");
            logger.info("enter", data);

            Redux.dispatch(OrderItem.actions.orderItemUpdatedEvent(data));
        });
    }*/
}