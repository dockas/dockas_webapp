import React from "react"
import {Bundle} from "common"
import loadPage from "bundle-loader?lazy!./index"

module.exports = {
    name: "catalog.route",

    Page: (props) => (
        <Bundle load={loadPage}>
            {(Page) => <Page {...props}/>}
        </Bundle>
    ),

    routes: [
        require("./list/route"),
        require("./item/route")
    ],
    
    loadPage
}