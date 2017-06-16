import Socket from "../utils/socket";
import {LoggerFactory,Redux} from "darch/src/utils";

let Logger = new LoggerFactory("product", {level: "debug"});

module.exports = class Product {
    static Card = require("./card");
    static PriceModal = require("./price_modal");

    static actions = require("./actions");
    static reducer = require("./reducer");
    static types = require("./types");

    // Register to socket events.
    static listenSocketEvents() {
        Socket.shared.on("product:updated", (data) => {
            let logger = Logger.create("product:updated");
            logger.info("enter", data);

            Redux.dispatch(Product.actions.productUpdatedEvent(data));
        });
    }
};