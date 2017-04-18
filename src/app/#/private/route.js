import lodash from "lodash";
import {LoggerFactory,Redux} from "darch/src/utils";

let Logger = new LoggerFactory("private.route");

module.exports = {
    path: "",

    onEnter(nextState, replace, cb) {
        let logger = Logger.create("onEnter");
        logger.info("enter");

        if(!lodash.get(Redux.shared.store.getState(), "user.uid")) {
            replace("/a/signin");
        }
        
        cb();
    },

    getComponent(nextState, cb) {
        require.ensure([], (require) => {
            cb(null, require("./page"));
        });
    },

    getChildRoutes(partialNextState, cb) {
        require.ensure([], (require) => {
            cb(null, [
                require("./messages/route"),
                require("./explore/route"),
                require("./create/route"),
                require("./account/route"),
                require("./room/route")
            ]);
        });
    },

    indexRoute: { 
        onEnter(nextState, replace) {
            replace("/messages");
        }
    }
};
