import React from "react"
import {withRouter} from "react-router-dom"
import {LoggerFactory} from "darch/src/utils"
import Container from "darch/src/container"
import authPol from "policies/auth"
import styles from "./styles"

let Logger = new LoggerFactory("account", {level:"error"})

/**
 * Main component class.
 */
class Component extends React.Component {
    /** React properties **/
    static displayName = "account";
    static defaultProps = {};
    static propTypes = {};

    state = {}

    /**
     * LYFECICLE : This function is called when component
     * got mounted in the view.
     */
    async componentDidMount() {
        let {history} = this.props,
            logger = Logger.create("componentDidMount")
        
        logger.info("enter")

        // Initialize
        try {
            await authPol(history)
        }
        catch(error) {
            return logger.error("authPol error", error)
        }

        this.setState({initialized: true})
    }

    /**
     * This function is responsible for generating the component's view.
     */
    render() {
        let {initialized} = this.state

        return initialized ? (
            <div className={styles.page}>
                <Container>
                    Account
                </Container>
            </div>
        ) : null
    }
}

/** Export **/
export default withRouter(Component)

