/* global mixpanel */

import React from "react";
import classNames from "classnames";
import {Link,withRouter} from "react-router";
import {connect} from "react-redux";
import {LoggerFactory} from "darch/src/utils";
import i18n from "darch/src/i18n";
import Bar from "darch/src/bar";
import Dropdown from "darch/src/dropdown";
import Label from "darch/src/label";
import logoIcon from "assets/images/logo_227x50.png";
import styles from "./styles";
import {Basket,Alert} from "common";

let Logger = new LoggerFactory("home.page");

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        user: state.user.profiles[state.user.uid]
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
    static displayName = "home.page";
    static defaultProps = {};
    static propTypes = {};

    /** Instance properties */
    state = {};

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");
    }

    onLogoutClick() {
        let logger = Logger.create("onLogoutClick");
        logger.info("enter");   
    }

    onBasketCardButtonClick() {
        let logger = Logger.create("onBasketCardButtonClick");
        logger.info("enter");

        mixpanel.track("start checkout button clicked");
        
        // If user are not logged, then prompt it to login or to
        // create an account.
        if(!this.props.user) {
            this.props.router.push({
                pathname: "/signin",
                query: {redirect: "/checkout"}
            });
        }
        else {
            this.props.router.push("/checkout");
        }
    }

    render() {
        let {user} = this.props;
        let {pathname} = this.props.location;

        console.log("PATHNAME", pathname);

        return (
            <div className={styles.page}>
                <Bar fixedOnTop={true} open={this.state.barOpen} onToggle={() => { this.setState({barOpen: !this.state.barOpen}); }}>
                    <Bar.Header>
                        <Bar.Menu togglable={false}>
                            <Bar.Item>
                                <Link to="/">
                                    <img className={styles.logo} src={logoIcon} />

                                    <span style={{
                                        marginLeft: "5px",
                                        display: "inline-block",
                                        verticalAlign: "top",
                                        position: "relative",
                                        top: "0px"
                                    }}>
                                        <Label color="danger" scale={0.7}>beta</Label>
                                    </span>
                                </Link>
                            </Bar.Item>
                        </Bar.Menu>

                        <Bar.Toggle
                            openComponent={<span className="icon-menu"></span>}
                            closeComponent={<span className="icon-delete"></span>}>
                        </Bar.Toggle>
                    </Bar.Header>
                    <Bar.Body>
                        <Bar.Menu>
                            {/*<Bar.Item>
                                <Link to="/messages" activeClassName="active">
                                    <i18n.Translate text="_NAV_BAR_MESSAGES_ITEM_LABEL_" />
                                </Link>
                            </Bar.Item>*/}

                            {user ? (
                                <Bar.Item>
                                    <Alert.Dropdown />
                                </Bar.Item>
                            ) : null}

                            {user ? (
                                <Bar.Item>
                                    <Link to="/lists" activeClassName="active">
                                        <span className="icon-checklist"></span> <i18n.Translate text="_NAV_BAR_LISTS_ITEM_LABEL_" />
                                    </Link>
                                </Bar.Item>
                            ) : null}

                            {user ? (
                                <Bar.Item>
                                    <Link to="/orders" activeClassName="active">
                                        <span className="icon-purchase-order"></span> <i18n.Translate text="_NAV_BAR_ORDERS_ITEM_LABEL_" />
                                    </Link>
                                </Bar.Item>
                            ) : null}

                            {user && user.roles.indexOf("admin") >= 0 ? (
                                <Bar.Item>
                                    <Link to="/admin" className={styles.createButton}>
                                        <i18n.Translate text="_NAV_BAR_ADMIN_ITEM_LABEL_" />
                                    </Link>
                                </Bar.Item>
                            ) : null}

                            {user ? (
                                <Bar.Item>
                                    <Dropdown Toggle={<span style={{fontSize: "26pt"}} 
                                    className={classNames(["icon-circled-user"])}></span>} 
                                    showCaret={false} 
                                    position="right"
                                    buttonLayout="none" 
                                    buttonColor="dark" 
                                    buttonScale={0.8}>
                                        <Dropdown.Item to="/account">
                                            <i18n.Translate text="_NAV_BAR_ACCOUNT_ITEM_LABEL_" />
                                        </Dropdown.Item>
                                        <Dropdown.Item to="/orders">
                                            <i18n.Translate text="_NAV_BAR_ORDERS_ITEM_LABEL_" />
                                        </Dropdown.Item>
                                        <Dropdown.Separator></Dropdown.Separator>
                                        <Dropdown.Item onClick={this.onLogoutClick}>
                                            <i18n.Translate text="_NAV_BAR_LOGOUT_ITEM_LABEL_" />
                                        </Dropdown.Item>
                                    </Dropdown>
                                </Bar.Item>
                            ) : (
                                <Bar.Item>
                                    <Link to="/signin" className={styles.signinButton}>
                                        <i18n.Translate text="_NAV_BAR_SIGNIN_ITEM_LABEL_" />
                                    </Link>
                                </Bar.Item>
                            )}
                        </Bar.Menu>
                    </Bar.Body>
                </Bar>

                <div className={styles.content}>
                    {this.props.children}
                </div>

                {(/^(\/?checkout)|(\/?invitation)/).test(pathname) ? null : (
                    <Basket.Card onClick={this.onBasketCardButtonClick}/>
                )}
            </div>
        );
    }
}

/** Export **/
export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Component));
