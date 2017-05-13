import React from "react";
import {connect} from "react-redux";
import {LoggerFactory,Redux} from "darch/src/utils";
import Container from "darch/src/container";
import i18n from "darch/src/i18n";
import {Alert} from "common";
import styles from "./styles";

let Logger = new LoggerFactory("catalog.page");

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        alerts: state.alert.data,
        newCount: state.alert.newCount
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
    static displayName = "catalog.page";
    static defaultProps = {};
    static propTypes = {};

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        Redux.dispatch(Alert.actions.alertFind({
            sort: {createdAt: -1}
        }));
    }

    render() {
        let {alerts} = this.props;

        return (
            <div>
                <Container size="sm">
                    <ul className={styles.list}>
                        {alerts && alerts.length ? (
                            alerts.map((alert) => {
                                return <Alert.Card key={alert._id} alert={alert} />;
                            })
                        ) : !alerts ? (
                            <li style={{textAlign: "center"}}>
                                carregando ...
                            </li>
                        ) : (
                            <li style={{textAlign: "center"}}>
                                <i18n.Translate text="_ALERTS_PAGE_NO_DATA_FOUND_MESSAGE_" />
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
