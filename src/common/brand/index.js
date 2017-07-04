import Socket from "../utils/socket";
import {LoggerFactory,Redux} from "darch/src/utils";

let Logger = new LoggerFactory("brand", {level: "debug"});

module.exports = class Brand {
    static Card = require("./card");

    static actions = require("./actions");
    static populator = require("./populator");
    static reducer = require("./reducer");
    static utils = require("./utils");

     // Register to socket events.
    static listenSocketEvents() {
        Socket.shared.on("brand:updated", (data) => {
            let logger = Logger.create("brand:updated");
            logger.info("enter", data);

            Redux.dispatch(Brand.actions.brandUpdatedEvent(data));
        });
    }
};