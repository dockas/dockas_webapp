import React from "react"
import {Bundle} from "common"
import loadPage from "bundle-loader?lazy!./index"

module.exports = {
    name: "home.route",

    Page: (props) => {
        //console.log(["caralha", props])

        return (
            <Bundle load={loadPage}>
                {(Page) => <Page {...props}/>}
            </Bundle>
        )
    },

    routes: [
        require("./catalog/route"),
        require("./brand/route"),
        require("./account/route"),
        require("./checkout/route"),
        require("./invitation/route"),
        require("./notifications/route"),
        require("./lists/route"),
        require("./orders/route"),
        require("./create/route"),
        require("./admin/route"),
        require("./approve/route")
    ],

    loadPage
}
