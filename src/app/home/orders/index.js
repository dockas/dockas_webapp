import React from "react"
import {withRouter} from "react-router-dom"
import {LoggerFactory,Redux} from "darch/src/utils"
import authPol from "policies/auth"
import {Basket,RouterUtil} from "common"

let Logger = new LoggerFactory("orders.page")

/**
 * Main component class.
 */
class Component extends React.Component {
    /** React properties **/
    static displayName = "orders.page";
    static defaultProps = {};
    static propTypes = {};

    state = {}

    async componentDidMount() {
        let {history} = this.props,
            logger = Logger.create("componentDidMount")

        logger.info("enter")

        // preload subroutes
        RouterUtil.preloadRoutes(this.props)

        // Show/Hide basket card
        Redux.dispatch(Basket.actions.basketSetShowCard(false))

        // Initialize
        try {
            await authPol(history)
        }
        catch(error) {
            return logger.error("authPol error", error)
        }

        this.setState({initialized: true})
    }

    render() {
        let {initialized} = this.state

        return initialized ? (
            <div>
                {RouterUtil.renderRoutes(this.props)}
            </div>
        ) : null
    }
}

/** Export **/
export default withRouter(Component)
