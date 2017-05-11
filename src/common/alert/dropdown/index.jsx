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

let Logger = new LoggerFactory("alert.dropdown");

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
    static displayName = "alert.dropdown";
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
                <span className={styles.title}><span className="icon-bell-2"></span> <i18n.Translate text="_NAV_BAR_ALERTS_ITEM_LABEL_" /></span> {newCount ? <Badge className={styles.badge} count={newCount} scale={0.8} color="danger" /> : null} 
            </span>
        );
    }

    onToggle() {
        Redux.dispatch(actions.alertFind({
            sort: {createdAt: -1}
        }));
    }

    render() {
        let {alerts} = this.props;

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
                    {alerts && alerts.length ? (
                        alerts.map((alert) => {
                            return <Card key={alert._id} alert={alert} />;
                        })
                    ) : !alerts ? (
                        <Dropdown.Item>
                            loading ...
                        </Dropdown.Item>
                    ) : (
                        <Dropdown.Item>
                            <div style={{textAlign: "center"}}>
                                <i18n.Translate text="_ALERTS_PAGE_NO_DATA_FOUND_MESSAGE_" />
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


