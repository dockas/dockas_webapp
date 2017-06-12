import Socket from "../utils/socket";
import {LoggerFactory,Redux} from "darch/src/utils";

let Logger = new LoggerFactory("user", {level: "debug"});

export default class User {
    /** Store utils **/
    static actions = require("./actions");
    static reducer = require("./reducer");

    // Register to socket events.
    static listenSocketEvents() {
        Socket.shared.on("user:updated", (data) => {
            let logger = Logger.create("user:updated");
            logger.info("enter", data);

            Redux.dispatch(User.actions.userUpdatedEvent(data));
        });
    }
}
