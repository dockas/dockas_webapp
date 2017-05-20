import {LoggerFactory,Redux} from "darch/src/utils";
import i18n from "darch/src/i18n";
import config from "config";
import {Api,User,Basket} from "common";

let Logger = new LoggerFactory("app.route");

module.exports = {
    path: "/",

    onEnter(nextState, replace, cb) {
        // Initialize i18n
        let logger = Logger.create("onEnter");
        logger.info("enter");

        var _initPromise = Promise.all([
            Redux.dispatch(i18n.actions.i18NInit("pt-br")),
            Redux.dispatch(User.actions.userInit()),
            Redux.dispatch(Basket.actions.basketInit()),
            Api.shared.configGet().then((sharedConfig) => {
                //console.log("sharedConfig got", sharedConfig);

                config.shared = sharedConfig;
            })
        ]);

        // Fire callback anyway
        _initPromise.then(function(result) {
            logger.info("all promises resolved", result);
            cb();
        }).catch(function() {cb();});
    },

    getComponent(nextState, cb) {
        require.ensure([], (require) => {
            cb(null, require("./page"));
        });
    },

    getChildRoutes(partialNextState, cb) {
        require.ensure([], (require) => {
            cb(null, [
                require("./home/route"),
                require("./signin/route"),
                require("./signup/route")
            ]);
        });
    }
};
