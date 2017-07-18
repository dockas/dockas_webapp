import React from "react"
import {Bundle} from "common"
import loadPage from "bundle-loader?lazy!./index"

module.exports = {
    name: "admin.orders.route",

    path: "orders",

    Page: (props) => {
        console.log(["caralha : admin orders", props])

        return (
            <Bundle load={loadPage}>
                {(Page) => <Page {...props}/>}
            </Bundle>
        )
    },

    routes: [],
    
    loadPage
}