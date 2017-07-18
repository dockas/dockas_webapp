import React from "react"
import {LoggerFactory,Redux} from "darch/src/utils"
import i18n from "darch/src/i18n"
import config from "config"
import {Api,User,Basket,Tag,Bundle} from "common"
import loadComponent from "bundle-loader?lazy!./page"

let Logger = new LoggerFactory("app.route")

module.exports = {
    path: "/",

    onEnter(nextState, replace, cb) {
        // Initialize i18n
        let logger = Logger.create("onEnter")
        logger.info("enter")

        var _initPromise = Promise.all([
            Redux.dispatch(i18n.actions.i18NInit("pt-br")),
            Redux.dispatch(User.actions.userInit()),
            Redux.dispatch(Basket.actions.basketInit()),
            Api.shared.configGet().then((sharedConfig) => {
                //console.log("sharedConfig got", sharedConfig);

                config.shared = sharedConfig
            })
        ])

        // Async get all tags sorted by popularity
        Redux.dispatch(Tag.actions.tagFind({
            sort: {findCount: -1}
        }, {scope: {id: "global"}}))

        // Fire callback anyway
        _initPromise.then(function(result) {
            logger.info("all promises resolved", result)
            cb()
        }).catch(function() {cb()})
    },

    component: (
        <Bundle load={loadComponent}>
            {(Component) => <Component {...this.props}/>}
        </Bundle>
    ),

    routes: [
        require("./home/route"),
        require("./signin/route"),
        require("./signup/route")
    ]
}
