import Socket from "../utils/socket";
import {LoggerFactory,Redux} from "darch/src/utils";

let Logger = new LoggerFactory("notification", {level: "debug"});

export default class Notification {
    static Dropdown = require("./dropdown");
    static Card = require("./dropdown/card");

    static actions = require("./actions");
    static reducer = require("./reducer");

    // Register to socket events.
    static listenSocketEvents() {
        Socket.shared.on("notification:created", (data) => {
            let logger = Logger.create("notification:created");
            logger.info("enter", data);

            Redux.dispatch(Notification.actions.notificationCreatedEvent(data));
        });

        Socket.shared.on("notification:updated", (data) => {
            let logger = Logger.create("notification:updated");
            logger.info("enter", data);

            Redux.dispatch(Notification.actions.notificationUpdatedEvent(data));
        });
    }
}