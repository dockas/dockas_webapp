import React from "react"
import {Bundle} from "common"
import loadPage from "bundle-loader?lazy!./index"

module.exports = {
    name: "admin.route",

    path: "admin",

    Page: (props) => {
        console.log(["caralha : admin", props])

        return (
            <Bundle load={loadPage}>
                {(Page) => <Page {...props}/>}
            </Bundle>
        )
    },

    routes: [
        require("./users/route"),
        require("./tags/route"),
        require("./orders/route"),
        require("./invitations/route"),
        require("./create/route")
    ],

    loadPage
}