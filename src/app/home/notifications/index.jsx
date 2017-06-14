import React from "react";
import {connect} from "react-redux";
import {LoggerFactory,Redux} from "darch/src/utils";
import Container from "darch/src/container";
import i18n from "darch/src/i18n";
import {NotificationAlert} from "common";
import styles from "./styles";

let Logger = new LoggerFactory("notifications.page");

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
    static displayName = "notification.page";
    static defaultProps = {};
    static propTypes = {};

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        Redux.dispatch(NotificationAlert.actions.notificationAlertFind({
            sort: {status: 1, createdAt: -1}
        }));
    }

    render() {
        let {notifications} = this.props;

        return (
            <div>
                <Container size="sm">
                    <ul className={styles.list}>
                        {notifications && notifications.length ? (
                            notifications.map((notification) => {
                                return <NotificationAlert.Card key={notification._id} notification={notification} />;
                            })
                        ) : !notifications ? (
                            <li style={{textAlign: "center"}}>
                                carregando ...
                            </li>
                        ) : (
                            <li style={{textAlign: "center"}}>
                                <i18n.Translate text="_NOTIFICATIONS_PAGE_NO_DATA_FOUND_MESSAGE_" />
                            </li>
                        )}
                    </ul>
                </Container>
            </div>
        );
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component);
