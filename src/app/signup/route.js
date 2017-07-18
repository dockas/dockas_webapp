import React from "react"
import {Bundle} from "common"
import loadPage from "bundle-loader?lazy!./index"

module.exports = {
    path: "signup",

    Page: (props) => (
        <Bundle load={loadPage}>
            {(Page) => <Page {...props}/>}
        </Bundle>
    ),

    loadPage
}
