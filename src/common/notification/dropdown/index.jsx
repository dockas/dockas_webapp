import React from "react";
//import lodash from "lodash";
import {connect} from "react-redux";
//import classNames from "classnames";
import {LoggerFactory,Redux} from "darch/src/utils";
import Dropdown from "darch/src/dropdown";
import i18n from "darch/src/i18n";
import styles from "./styles";
import Card from "./card";
import actions from "../actions";
import Badge from "../../badge";

let Logger = new LoggerFactory("notification.dropdown");

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        notifications: state.notification.data,
        newCount: state.notification.newCount
    };
}

/**
 * Redux dispatch to props map.
 */
let mapDispatchToProps = {

};

/**
 * Main component class.
 */
class Component extends React.Component {
    /** React properties **/
    static displayName = "notification.dropdown";
    static defaultProps = {};
    static propTypes = {};

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");
    }

    renderToggle() {
        let {newCount} = this.props;

        return (
            <span>
                <span className={styles.title}><span className="icon-bell-2"></span> <i18n.Translate text="_NAV_BAR_NOTIFICATIONS_ITEM_LABEL_" /></span> {newCount ? <Badge className={styles.badge} count={newCount} scale={0.8} color="danger" /> : null} 
            </span>
        );
    }

    onToggle() {
        Redux.dispatch(actions.notificationFind({
            sort: {status: 1, createdAt: -1}
        }));
    }

    render() {
        let {notifications} = this.props;

        return (
            <Dropdown Toggle={this.renderToggle()}
                showCaret={false} 
                position="right"
                buttonLayout="none" 
                buttonColor="dark" 
                buttonScale={0.8}
                width="280pt"
                height="300pt"
                onToggle={this.onToggle}
                className={styles.dropdown}>
                    {notifications && notifications.length ? (
                        notifications.map((notification) => {
                            return <Card key={notification._id} notification={notification} />;
                        })
                    ) : !notifications ? (
                        <Dropdown.Item>
                            loading ...
                        </Dropdown.Item>
                    ) : (
                        <Dropdown.Item>
                            <div style={{textAlign: "center"}}>
                                <i18n.Translate text="_NOTIFICATION_PAGE_NO_DATA_FOUND_MESSAGE_" />
                            </div>
                        </Dropdown.Item>    
                    )}
            </Dropdown>
        );
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component);


