import React from "react"
import {Bundle} from "common"
import loadPage from "bundle-loader?lazy!./index"

module.exports = {
    path: ":id",

    Page: (props) => (
        <Bundle load={loadPage}>
            {(Page) => <Page {...props}/>}
        </Bundle>
    ),

    routes: [
        require("./products/route"),
        require("./info/route"),
        require("./statistics/route"),
        require("./photos/route"),
        require("./orders/route"),
        require("./wallet/route")
    ],
    
    loadPage
}