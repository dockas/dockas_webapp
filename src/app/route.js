import React from "react"
import {Bundle} from "common"
import loadPage from "bundle-loader?lazy!./index"

module.exports = {
    name: "app.route",
    
    path: "/",

    Page: (props) => (
        <Bundle load={loadPage}>
            {(Page) => <Page {...props}/>}
        </Bundle>
    ),

    routes: [
        require("./home/route"),
        require("./signin/route"),
        require("./signup/route")
    ],

    loadPage
}
