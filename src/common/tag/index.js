import Socket from "../utils/socket"
import {LoggerFactory,Redux} from "darch/src/utils"

let Logger = new LoggerFactory("tag", {level: "debug"})

module.exports = class Tag {
    static actions = require("./actions");
    static reducer = require("./reducer");
    static populator = require("./populator");
    //static types = require("./types");

    // Register to socket events.
    static listenSocketEvents() {
        Socket.shared.on("tag:updated", (data) => {
            let logger = Logger.create("tag:updated")
            logger.info("enter", data)

            Redux.dispatch(Tag.actions.tagUpdatedEvent(data))
        })

        Socket.shared.on("tags:updated", (data) => {
            let logger = Logger.create("tags:updated")
            logger.info("enter", data)

            Redux.dispatch(Tag.actions.tagsUpdatedEvent(data))
        })

        Socket.shared.on("tag:created", (data) => {
            let logger = Logger.create("tag:created")
            logger.info("enter", data)

            Redux.dispatch(Tag.actions.tagCreatedEvent(data))
        })
    }
}