import React from "react"
//import lodash from "lodash";
import {connect} from "react-redux"
//import classNames from "classnames";
import {LoggerFactory,Redux} from "darch/src/utils"
import Dropdown from "darch/src/dropdown"
import i18n from "darch/src/i18n"
import styles from "./styles"
import Card from "./card"
import actions from "../actions"
//import Badge from "../../badge";

let Logger = new LoggerFactory("notification_alert.dropdown")

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        notifications: state.notificationAlert.data,
        newCount: state.notificationAlert.newCount
    }
}

/**
 * Redux dispatch to props map.
 */
let mapDispatchToProps = {

}

/**
 * Main component class.
 */
class Component extends React.Component {
    /** React properties **/
    static displayName = "notification_alert.dropdown";
    static defaultProps = {};
    static propTypes = {};

    componentDidMount() {
        let logger = Logger.create("componentDidMount")
        logger.info("enter")
    }

    renderToggle() {
        let {newCount} = this.props

        return (
            <div className={styles.badgeContainer}>
                <span className={styles.title}><span className="icon-bell-3"></span></span> {newCount ? <div className={styles.badge}></div> : null} 
            </div>
        )
    }

    onToggle() {
        Redux.dispatch(actions.notificationAlertFind({
            sort: {status: 1, createdAt: -1}
        }))
    }

    render() {
        let {notifications} = this.props

        return (
            <Dropdown Toggle={this.renderToggle()}
                showCaret={false} 
                arrowOffset={4}
                position="right"
                buttonLayout="none" 
                buttonColor="dark" 
                buttonScale={1}
                width="280pt"
                height="300pt"
                overflow="scroll"
                theme={this.props.theme}
                onToggle={this.onToggle}
                className={styles.dropdown}>
                
                {notifications && notifications.length ? (
                    notifications.map((notification) => {
                        return <Card key={notification._id} notification={notification} />
                    })
                ) : !notifications ? (
                    <Dropdown.Item>
                        loading ...
                    </Dropdown.Item>
                ) : (
                    <Dropdown.Item>
                        <div style={{textAlign: "center"}}>
                            <i18n.Translate text="_NOTIFICATIONS_PAGE_NO_DATA_FOUND_MESSAGE_" />
                        </div>
                    </Dropdown.Item>    
                )}
            </Dropdown>
        )
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component)


