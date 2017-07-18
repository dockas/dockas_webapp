import React from "react"
import {LoggerFactory,Redux} from "darch/src/utils"
import {Basket,RouterUtil} from "common"

let Logger = new LoggerFactory("catalog.page")

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "catalog.page";
    static defaultProps = {};
    static propTypes = {};

    componentDidMount() {
        let logger = Logger.create("componentDidMount")
        logger.info("enter")

        // preload subroutes
        RouterUtil.preloadRoutes(this.props)

        Redux.dispatch(Basket.actions.basketSetShowCard(true))
    }

    render() {
        return (
            <div>
                {RouterUtil.renderRoutes(this.props, "catalog.page")}
            </div>
        )
    }
}
