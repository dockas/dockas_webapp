import React from "react"
import {Bundle} from "common"
import loadPage from "bundle-loader?lazy!./index"

module.exports = {
    path: "checkout",

    Page: (props) => (
        <Bundle load={loadPage}>
            {(Page) => <Page {...props}/>}
        </Bundle>
    ),

    routes: [
        require("./review/route"),
        require("./payment/route"),
        require("./finalize/route")
    ],
    
    loadPage
}