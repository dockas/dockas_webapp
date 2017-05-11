import Socket from "../utils/socket";
import {LoggerFactory,Redux} from "darch/src/utils";

let Logger = new LoggerFactory("alert", {level: "debug"});

export default class Alert {
    static Dropdown = require("./dropdown");

    static actions = require("./actions");
    static reducer = require("./reducer");

    // Register to socket events.
    static listenSocketEvents() {
        Socket.shared.on("alert:created", (data) => {
            let logger = Logger.create("alert:created");
            logger.info("enter", data);

            Redux.dispatch(Alert.actions.alertCreatedEvent(data));
        });

        Socket.shared.on("alert:updated", (data) => {
            let logger = Logger.create("alert:updated");
            logger.info("enter", data);

            Redux.dispatch(Alert.actions.alertUpdatedEvent(data));
        });
    }
}