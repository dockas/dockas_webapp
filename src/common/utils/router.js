import React from "react"
import lodash from "lodash"
import {Route,Switch} from "react-router-dom"

export default class RouteUtil {
    static preloadRoutes(props={}) {
        let {routes} = props

        if(!routes || !routes.length) {return}

        for(let route of routes) {
            route.loadPage(() => {})
        }
    }

    static renderRoutes(props={}) {
        let {routePath,routes} = props

        //console.log(["renderRoutes enter", namespace, props])

        if(!routes || !routes.length) {return}

        return (
            <Switch>
                {lodash.map(lodash.orderBy(routes, [(route) => {
                    return `${(route.path||"").replace(/^\//,"")}`
                }], ["desc"]), (RouteSpec, i) => {
                    let path = `${(routePath||"").replace(/\/$/, "")}/${(RouteSpec.path||"").replace(/^\//, "")}`

                    //console.log(["route path", routePath, path])

                    return (
                        <Route key={i}
                            path={path}
                            render={(props) => {
                                return (
                                    <RouteSpec.Page {...props} routePath={path} routes={RouteSpec.routes} />
                                )
                            }}>
                        </Route>
                    )
                })}
            </Switch>
        )
    }
}

/**
 * <div>
                                    

                                    {RouteSpec.redirect ? (
                                        <Redirect from={url} to={RouteSpec.redirect.to} />
                                    ) : undefined}
                                </div>
 */