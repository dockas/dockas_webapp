/* global mixpanel */

import React from "react";
import classNames from "classnames";
import lodash from "lodash";
import config from "config";
import {Link,withRouter} from "react-router";
import {connect} from "react-redux";
import {LoggerFactory,Style} from "darch/src/utils";
import i18n from "darch/src/i18n";
import Bar from "darch/src/bar";
import Dropdown from "darch/src/dropdown";
import Text from "darch/src/text";
import logoIcon from "assets/images/logo_227x50.png";
import styles from "./styles";
import {Basket,Alert,Badge} from "common";

let Logger = new LoggerFactory("home.page", {level: "debug"});

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        user: state.user.profiles[state.user.uid],
        location: state.location,
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
    static displayName = "home.page";
    static defaultProps = {};
    static propTypes = {};

    /** Instance properties */
    state = {
        screenSize: "desktop"
    };

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        window.addEventListener("resize", this.handleWindowResize);

        this.handleWindowResize();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleWindowResize);
    }

    componentDidUpdate(prevProps) {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        if(lodash.get(this.props,"location.pathname") != lodash.get(prevProps, "location.pathname")) {
            logger.debug("location has changed");

            this.setState({barOpen: false});
        }
    }

    handleWindowResize() {
        let logger = Logger.create("handleWindowResize");

        let {screenSize} = this.state;
        let currentScreenSize = Style.screenForWindowWidth(window.innerWidth);

        if(currentScreenSize != screenSize) {
            logger.info("enter", {screenSize, currentScreenSize});
            this.setState({screenSize: currentScreenSize});
        }
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
        let {user,newCount} = this.props;
        let {pathname} = this.props.location;
        let {screenSize} = this.state;

        console.log("PATHNAME", pathname);

        return (
            <div className={styles.page}>
                <Bar fixedOnTop={true} open={this.state.barOpen} onToggle={() => { this.setState({barOpen: !this.state.barOpen}); }}>
                    <Bar.Header>
                        <Bar.Menu togglable={false}>
                            <Bar.Item>
                                <Link to="/">
                                    <img className={styles.logo} src={logoIcon} />

                                    {config.isBeta ? (
                                        <span className={styles.betaContainer}>
                                            <Text color="danger" scale={0.7}>BETA</Text>
                                        </span>
                                    ) : null}
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

                            {user && screenSize != "phone" ? (
                                <Bar.Item>
                                    <Alert.Dropdown />
                                </Bar.Item>
                            ) : null}

                            {user && screenSize == "phone" ? (
                                <Bar.Item>
                                    <Link to="/alerts" activeClassName="active">
                                        <span className="icon-bell-2"></span> <i18n.Translate text="_NAV_BAR_ALERTS_ITEM_LABEL_" /> {newCount ? <Badge className={styles.badge} count={newCount} scale={0.8} color="danger" /> : null}
                                    </Link>
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

                            {user && screenSize == "phone" ? (
                                <Bar.Item>
                                    <Link to="/account" activeClassName="active">
                                        <span className="icon-circled-user"></span> <i18n.Translate text="_NAV_BAR_ACCOUNT_ITEM_LABEL_" />
                                    </Link>
                                </Bar.Item>
                            ) : null}

                            {user && screenSize == "phone" ? (
                                <Bar.Item>
                                    <a onClick={this.onLogoutClick}>
                                        <span className="icon-exit"></span> <i18n.Translate text="_NAV_BAR_SIGNOUT_ITEM_LABEL_" />
                                    </a>
                                </Bar.Item>
                            ) : null}

                            {user && user.roles.indexOf("admin") >= 0 ? (
                                <Bar.Item>
                                    <Link to="/admin" className={styles.createButton}>
                                        <i18n.Translate text="_NAV_BAR_ADMIN_ITEM_LABEL_" />
                                    </Link>
                                </Bar.Item>
                            ) : null}

                            {user && screenSize != "phone" ? (
                                <Bar.Item>
                                    <div className={styles.accountDropdown}>
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
                                            <Dropdown.Separator></Dropdown.Separator>
                                            <Dropdown.Item onClick={this.onLogoutClick}>
                                                <i18n.Translate text="_NAV_BAR_SIGNOUT_ITEM_LABEL_" />
                                            </Dropdown.Item>
                                        </Dropdown>
                                    </div>
                                </Bar.Item>
                            ) : null}

                            {!user ? (
                                <Bar.Item>
                                    <Link to="/signin" className={styles.signinButton}>
                                        <i18n.Translate text="_NAV_BAR_SIGNIN_ITEM_LABEL_" />
                                    </Link>
                                </Bar.Item>
                            ) : null}
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
