import React from "react"
import {Route} from "react-router-dom"
import {Bundle} from "common"
import loadPage from "bundle-loader?lazy!./page"

// Sub routes
import HomeRoute from "./home/route";
import SigninRoute from "./signin/route";
import SignupRoute from "./signup/route";

export default (props) => {
    <Bundle load={loadPage}>
        {(Page) => {
            <Page {...props}>

                {/* Subroutes */}
                <Route path={`${props.match.url}`} component={} />
            </Page>
        }}
    </Bundle>
}