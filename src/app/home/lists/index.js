import React from "react"
import {LoggerFactory,Redux} from "darch/src/utils"
import {Basket,RouterUtil} from "common"

let Logger = new LoggerFactory("lists.page")

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "lists.page";
    static defaultProps = {};
    static propTypes = {};

    componentDidMount() {
        let logger = Logger.create("componentDidMount")
        logger.info("enter")

        // preload subroutes
        RouterUtil.preloadRoutes(this.props)

        // Show basket card
        Redux.dispatch(Basket.actions.basketSetShowCard(false))
    }

    render() {
        return (
            <div>
                {RouterUtil.renderRoutes(this.props)}
            </div>
        )
    }
}
