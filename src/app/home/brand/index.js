import React from "react"
import {LoggerFactory} from "darch/src/utils"
import {RouterUtil} from "common"

let Logger = new LoggerFactory("brand.page")

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "brand.page";
    static defaultProps = {};
    static propTypes = {};

    componentDidMount() {
        let logger = Logger.create("componentDidMount")
        logger.info("enter")

        // preload subroutes
        RouterUtil.preloadRoutes(this.props)
    }

    render() {
        return (
            <div>
                {RouterUtil.renderRoutes(this.props)}
            </div>
        )
    }
}
