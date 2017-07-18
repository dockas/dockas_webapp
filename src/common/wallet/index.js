import Socket from "../utils/socket"
import {LoggerFactory,Redux} from "darch/src/utils"

let Logger = new LoggerFactory("wallet", {level: "debug"})

module.exports = class Wallet {
    static actions = require("./actions");
    static reducer = require("./reducer");

    // Register to socket events.
    static listenSocketEvents() {
        Socket.shared.on("wallet:updated", (data) => {
            let logger = Logger.create("wallet:updated")
            logger.info("enter", data)

            Redux.dispatch(Wallet.actions.walletUpdatedEvent(data))
        })
    }
}