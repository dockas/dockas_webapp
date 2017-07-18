import React from "react"
import {Bundle} from "common"
import loadPage from "bundle-loader?lazy!./index"

module.exports = {
    path: "create",

    Page: (props) => (
        <Bundle load={loadPage}>
            {(Page) => <Page {...props}/>}
        </Bundle>
    ),

    routes: [
        require("./product/route"),
        require("./brand/route"),
        require("./list/route")
    ],
    
    loadPage
}