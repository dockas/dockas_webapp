import React from "react"
import {NavLink,withRouter} from "react-router-dom"
import {LoggerFactory} from "darch/src/utils"
import Grid from "darch/src/grid"
import Container from "darch/src/container"
import adminPol from "policies/admin"
import {RouterUtil} from "common"
import styles from "./styles"

let Logger = new LoggerFactory("admin.page")

/**
 * Main component class.
 */
class Component extends React.Component {
    /** React properties **/
    static displayName = "admin.page";
    static defaultProps = {};
    static propTypes = {};

    state = {}

    async componentDidMount() {
        let {history} = this.props,
            logger = Logger.create("componentDidMount")

        logger.info("enter")

        // preload subroutes
        RouterUtil.preloadRoutes(this.props)

        // Initialize
        try {
            await adminPol(history)
        }
        catch(error) {
            return logger.error("adminPol error", error)
        }

        this.setState({initialized: true})
    }

    render() {
        let {initialized} = this.state
        
        return initialized ? (
            <div>
                <Container>
                    <Grid>
                        <Grid.Cell>
                            <ul className={styles.menu}>
                                <li><NavLink to="/admin/orders" activeClassName={styles.active}>pedidos</NavLink></li>
                                <li><NavLink to="/admin/users" activeClassName={styles.active}>usuários</NavLink></li>
                                <li><NavLink to="/admin/invitations" activeClassName={styles.active}>convites</NavLink></li>
                                <li><NavLink to="/admin/tags" activeClassName={styles.active}>tags</NavLink></li>
                            </ul>
                        </Grid.Cell>

                        <Grid.Cell span={5}>
                            <div className={styles.body}>
                                {RouterUtil.renderRoutes(this.props, "admin.page")}
                            </div>
                        </Grid.Cell>
                    </Grid>
                </Container>
            </div>
        ) : null
    }
}

/**
 * Export component
 */
export default withRouter(Component)
