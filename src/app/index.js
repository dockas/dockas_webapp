import React from "react"
import config from "config"
//import lodash from "lodash"
//import {Route,Link,Switch} from "react-router-dom"
import {LoggerFactory,Redux} from "darch/src/utils"
import Toaster from "darch/src/toaster"
import i18n from "darch/src/i18n"
import {Api,User,Basket,Tag,RouterUtil} from "common"
import styles from "./styles"
import toasterTheme from "./theme-toaster"

let Logger = new LoggerFactory("app.page")

// Page component
export default class Page extends React.Component {
    //React properties
    static displayName = "app.page";
    static defaultProps = {};
    static propTypes = {};

    state = {}

    async componentDidMount() {
        let logger = Logger.create("componentDidMount")
        logger.info("enter")

        // preload subroutes
        RouterUtil.preloadRoutes(this.props)

        // Set app as ready.
        window.appReady = true

        // If all resources are also ready, then remove loader.
        if(window.resourcesReady) {
            var loader = document.getElementById("loader-overlay")
            if(loader){ loader.style.display = "none" }

            window.appLoaded = true
        }

        try {
            await Promise.all([
                Redux.dispatch(i18n.actions.i18NInit("pt-br")),
                Redux.dispatch(User.actions.userInit()),
                Redux.dispatch(Basket.actions.basketInit()),
                Api.shared.configGet().then((sharedConfig) => {
                    config.shared = sharedConfig
                })
            ])

            logger.info("all promises resolved")
        }
        catch(error) {
            logger.error("all promises error", error)
        }

        // Async get all tags sorted by popularity
        Redux.dispatch(Tag.actions.tagFind({
            sort: {findCount: -1}
        }, {scope: {id: "global"}}))

        // Set initialized
        this.setState({initialized: true})
    }

    render() {
        let {initialized} = this.state

        return (
            <div className={styles.page}>
                {initialized ? (
                    RouterUtil.renderRoutes(this.props, "app.page")
                ) : null}

                <Toaster theme={toasterTheme} position="top-center" scale={0.9}/>
            </div>
        )
    }
}

/**
 * <div>
                        <Switch>
                            <Route exact path="/signin" render={() => (
                                <div>
                                    <div>Signin</div>
                                    <Link to="/signup">signup</Link>
                                </div>
                            )} />

                            <Route exact path="/signup" render={() => (
                                <div>
                                    <div>Signup</div>
                                    <Link to="/">home</Link>
                                </div>
                            )} />

                            <Route path="/" render={() => (
                                <div>
                                    <div>Home</div>
                                    <Link to="/signin">signin</Link>

                                    <Switch>
                                        <Route path="/admin" render={() => (
                                            <div>
                                                <div>Admin</div>
                                            </div>
                                        )} />

                                        <Route path="/" render={() => (
                                            <div>
                                                <div>Catalog</div>

                                                <Switch>
                                                    <Route path="/item/:nameId" render={() => (
                                                        <div>
                                                            <div>Item</div>
                                                        </div>
                                                    )} />

                                                    <Route path="/" render={() => (
                                                        <div>
                                                            <div>List</div>
                                                            <Link to="/item/zabulu">zabul</Link>
                                                        </div>
                                                    )} />
                                                </Switch>
                                            </div>
                                        )} />
                                    </Switch>
                                </div>
                            )} />
                        </Switch>
                    </div>
 */