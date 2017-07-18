import Socket from "../utils/socket"
import {LoggerFactory,Redux} from "darch/src/utils"

let Logger = new LoggerFactory("notification", {level: "debug"})

export default class NotificationAlert {
    static Dropdown = require("./dropdown");
    static Card = require("./dropdown/card");

    static actions = require("./actions");
    static reducer = require("./reducer");

    // Register to socket events.
    static listenSocketEvents() {
        Socket.shared.on("notification:alert:created", (data) => {
            let logger = Logger.create("notification:alert:created")
            logger.info("enter", data)

            Redux.dispatch(NotificationAlert.actions.notificationAlertCreatedEvent(data))
        })

        Socket.shared.on("notification:alert:updated", (data) => {
            let logger = Logger.create("notification:alert:updated")
            logger.info("enter", data)

            Redux.dispatch(NotificationAlert.actions.notificationAlertUpdatedEvent(data))
        })
    }
}