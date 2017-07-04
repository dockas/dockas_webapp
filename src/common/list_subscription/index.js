import Socket from "../utils/socket";
import {LoggerFactory,Redux} from "darch/src/utils";

let Logger = new LoggerFactory("list", {level: "debug"});

module.exports = class List {
    static actions = require("./actions");
    //static populator = require("./populator");
    static reducer = require("./reducer");
    //static types = require("./types");

    // Register to socket events.
    static listenSocketEvents() {
        Socket.shared.on("list_subscription:updated", (data) => {
            let logger = Logger.create("list_subscription:updated");
            logger.info("enter", data);

            Redux.dispatch(List.actions.listSubscriptionUpdatedEvent(data));
        });
    }
};
