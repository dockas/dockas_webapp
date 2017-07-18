import React from "react"
import {Bundle} from "common"
import loadPage from "bundle-loader?lazy!./index"

module.exports = {
    path: "coupons",

    Page: (props) => (
        <Bundle load={loadPage}>
            {(Page) => <Page {...props}/>}
        </Bundle>
    ),

    routes: [],
    
    loadPage
}