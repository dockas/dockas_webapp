import React from "react"
import lodash from "lodash"
import {Redux} from "darch/src/utils"
import {Bundle} from "common"
import loadPage from "bundle-loader?lazy!./index"

module.exports = {
    path: "invitation/hero",

    Page: (props) => (
        <Bundle load={loadPage}>
            {(Page) => <Page {...props}/>}
        </Bundle>
    ),

    routes: [],
    
    loadPage
}