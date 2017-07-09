import React from "react";
import classNames from "classnames";
import lodash from "lodash";
import config from "config";
import {Link,withRouter} from "react-router";
import {connect} from "react-redux";
import {LoggerFactory,Style,Redux} from "darch/src/utils";
import i18n from "darch/src/i18n";
import Bar from "darch/src/bar";
import Dropdown from "darch/src/dropdown";
import Text from "darch/src/text";
//import Label from "darch/src/label";
import logoIcon from "assets/images/logo_light_orange_227x50.png";
import styles from "./styles";
import barTheme from "./theme-bar";
import barItemTheme from "./theme-bar-item";
import barItemTheme2 from "./theme-bar-item-2";
import barItemTheme3 from "./theme-bar-item-3";
import barMenuTheme from "./theme-bar-menu";
import barItemMobileTheme from "./theme-bar-item-mobile";
import dropdownTheme from "./theme-dropdown";
import {Basket,NotificationAlert,Badge,Auth,Tracker} from "common";

let Logger = new LoggerFactory("home.page", {level: "debug"});

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        user: state.user.data[state.user.uid],
        location: state.location,
        newCount: state.notificationAlert.newCount,
        basket: state.basket
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

    async onSignoutClick() {
        let logger = Logger.create("onSignoutClick");
        logger.info("enter");

        try {
            let result = await Redux.dispatch(Auth.actions.signout());
            logger.debug("auth signout action success", result);

            this.props.router.replace("/signin");
        }
        catch(error) {
            logger.error("auth signout action error", error);
        }
    }

    onBasketCardButtonClick() {
        let logger = Logger.create("onBasketCardButtonClick");
        logger.info("enter");

        Tracker.track("start checkout button clicked");

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
        let {user,newCount,basket} = this.props;
        //let {pathname} = this.props.location;
        let {screenSize} = this.state;
        let isSeller = user && user.roles.indexOf("seller") >= 0;
        let isAdmin = user && user.roles.indexOf("admin") >= 0;

        //console.log("PATHNAME", pathname);

        return (
            <div className={styles.page}>
                <div className={styles.pageContent}>
                    <Bar backgroundColor="#000000"
                        scale={1}
                        fixedOnTop={true}
                        theme={barTheme}
                        open={this.state.barOpen}
                        onToggle={() => { this.setState({barOpen: !this.state.barOpen}); }}>
                        <Bar.Header>
                            <Bar.Menu togglable={false}>
                                <Bar.Item theme={barItemTheme}>
                                    <Link style={{lineHeight: 1}} to="/">
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
                                openComponent={<span className="icon-menu" style={{color: "white"}}></span>}
                                closeComponent={<span className="icon-delete" style={{color: "white"}}></span>}>
                            </Bar.Toggle>
                        </Bar.Header>
                        <Bar.Body>
                            <Bar.Menu theme={barMenuTheme}>
                                {/*<Bar.Item>
                                    <Link to="/messages" activeClassName="active">
                                        <i18n.Translate text="_NAV_BAR_MESSAGES_ITEM_LABEL_" />
                                    </Link>
                                </Bar.Item>*/}

                                {user && screenSize == "phone" ? (
                                    <Bar.Item theme={barItemMobileTheme}>
                                        <Link to="/lists" activeClassName="active">
                                            <i18n.Translate text="_NAV_BAR_LISTS_ITEM_LABEL_" format="upper" />
                                        </Link>
                                    </Bar.Item>
                                ) : null}

                                {user && screenSize == "phone" ? (
                                    <Bar.Item theme={barItemMobileTheme}>
                                        <Link to="/notifications" activeClassName="active">
                                            <i18n.Translate text="_NAV_BAR_NOTIFICATIONS_ITEM_LABEL_" format="upper" /> {newCount ? <Badge className={styles.badge} count={newCount} scale={0.8} color="danger" /> : null}
                                        </Link>
                                    </Bar.Item>
                                ) : null}

                                {isSeller && screenSize == "phone" ? (
                                    <Bar.Item theme={barItemMobileTheme}>
                                        <Link to="/create/brand" activeClassName="active">
                                            <i18n.Translate text="_NAV_BAR_CREATE_BRAND_ITEM_LABEL_" format="upper" />
                                        </Link>
                                    </Bar.Item>
                                ) : null}

                                {isSeller && screenSize == "phone" ? (
                                    <Bar.Item theme={barItemMobileTheme}>
                                        <Link to="/create/product" activeClassName="active">
                                            <i18n.Translate text="_NAV_BAR_CREATE_PRODUCT_ITEM_LABEL_" format="upper" />
                                        </Link>
                                    </Bar.Item>
                                ) : null}

                                {user && screenSize == "phone" ? (
                                    <Bar.Item theme={barItemMobileTheme}>
                                        <Link to="/account" activeClassName="active">
                                            <i18n.Translate text="_NAV_BAR_ACCOUNT_ITEM_LABEL_" format="upper" />
                                        </Link>
                                    </Bar.Item>
                                ) : null}

                                {user && screenSize == "phone" ? (
                                    <Bar.Item theme={barItemMobileTheme}>
                                        <Link to="/orders" activeClassName="active">
                                            <i18n.Translate text="_NAV_BAR_MY_ORDERS_ITEM_LABEL_" format="upper" />
                                        </Link>
                                    </Bar.Item>
                                ) : null}

                                {user && screenSize == "phone" ? (
                                    <Bar.Item theme={barItemMobileTheme}>
                                        <a onClick={this.onLogoutClick}>
                                            <i18n.Translate text="_NAV_BAR_SIGNOUT_ITEM_LABEL_" format="upper" />
                                        </a>
                                    </Bar.Item>
                                ) : null}

                                {!user && screenSize == "phone"  ? (
                                    <Bar.Item theme={barItemMobileTheme}>
                                        <Link to="/signin">
                                            <i18n.Translate text="_NAV_BAR_SIGNIN_ITEM_LABEL_" format="upper" />
                                        </Link>
                                    </Bar.Item>
                                ) : null}

                                {user && screenSize != "phone" ? (
                                    <Bar.Item theme={barItemTheme}>
                                        <Link to="/lists" activeClassName="active">
                                            <i18n.Translate text="_NAV_BAR_LISTS_ITEM_LABEL_" format="upper" />
                                        </Link>
                                    </Bar.Item>
                                ) : null}

                                {/*user && screenSize != "phone" ? (
                                    <Bar.Item theme={barItemTheme}>
                                        <Link to="/orders" activeClassName="active">
                                            <i18n.Translate text="_NAV_BAR_ORDERS_ITEM_LABEL_" format="upper" />
                                        </Link>
                                    </Bar.Item>
                                ) : null*/}

                                {user && screenSize != "phone" ? (
                                    <Bar.Item theme={barItemTheme3}>
                                        <NotificationAlert.Dropdown theme={dropdownTheme} />
                                    </Bar.Item>
                                ) : null}

                                {user && isSeller && screenSize != "phone" ? (
                                    <Bar.Item theme={barItemTheme2}>
                                        <Dropdown Toggle={<span className={classNames(["icon-plus-strong", styles.addButton])}></span>}
                                        theme={dropdownTheme}
                                        showCaret={true}
                                        arrowOffset={10}
                                        position="right"
                                        buttonLayout="none"
                                        buttonColor="dark"
                                        buttonScale={1}>
                                            <Dropdown.Item to="/create/brand">
                                                <i18n.Translate text="_NAV_BAR_CREATE_BRAND_ITEM_LABEL_" />
                                            </Dropdown.Item>

                                            <Dropdown.Item to="/create/product">
                                                <i18n.Translate text="_NAV_BAR_CREATE_PRODUCT_ITEM_LABEL_" />
                                            </Dropdown.Item>
                                        </Dropdown>
                                    </Bar.Item>
                                ) : null}

                                {user && screenSize != "phone" ? (
                                    <Bar.Item theme={barItemTheme2}>
                                        <Dropdown Toggle={<span className={classNames(["icon-circled-user", styles.profileButton])}></span>}
                                            theme={dropdownTheme}
                                            showCaret={false}
                                            arrowOffset={8}
                                            position="right"
                                            buttonLayout="none"
                                            buttonColor="dark"
                                            buttonScale={1}>
                                            <Dropdown.Item>
                                                <i18n.Translate text="_HELLO_USER_" data={{
                                                    firstName: user.fullName.split(" ")[0]
                                                }} />
                                            </Dropdown.Item>

                                            <Dropdown.Separator></Dropdown.Separator>

                                            <Dropdown.Item to="/account">
                                                <i18n.Translate text="_NAV_BAR_ACCOUNT_ITEM_LABEL_" />
                                            </Dropdown.Item>

                                            <Dropdown.Item to="/orders">
                                                <i18n.Translate text="_NAV_BAR_MY_ORDERS_ITEM_LABEL_" />
                                            </Dropdown.Item>

                                            {isAdmin ? (
                                                <Dropdown.Separator>admin</Dropdown.Separator>
                                            ): <span></span>}
                                            {isAdmin ? (
                                                <Dropdown.Item to="/admin/orders">
                                                    <i18n.Translate text="_NAV_BAR_ADMIN_ORDERS_ITEM_LABEL_" />{/*<span style={{marginLeft: "5px"}}><Label color="#F9690E" scale={0.5}><i18n.Translate text="_NAV_BAR_ADMIN_ITEM_LABEL_" /></Label></span>*/}
                                                </Dropdown.Item>
                                            ) : <span></span>}
                                            {isAdmin ? (
                                                <Dropdown.Item to="/admin/users">
                                                    <i18n.Translate text="_NAV_BAR_ADMIN_USERS_ITEM_LABEL_" />{/*<span style={{marginLeft: "5px"}}><Label color="#F9690E" scale={0.5}><i18n.Translate text="_NAV_BAR_ADMIN_ITEM_LABEL_" /></Label></span>*/}
                                                </Dropdown.Item>
                                            ) : <span></span>}
                                            {isAdmin ? (
                                                <Dropdown.Item to="/admin/invitations">
                                                    <i18n.Translate text="_NAV_BAR_ADMIN_INVITATIONS_ITEM_LABEL_" />{/*<span style={{marginLeft: "5px"}}><Label color="#F9690E" scale={0.5}><i18n.Translate text="_NAV_BAR_ADMIN_ITEM_LABEL_" /></Label></span>*/}
                                                </Dropdown.Item>
                                            ) : <span></span>}
                                            {isAdmin ? (
                                                <Dropdown.Item to="/admin/tags">
                                                    <i18n.Translate text="_NAV_BAR_ADMIN_TAGS_ITEM_LABEL_" />{/*<span style={{marginLeft: "5px"}}><Label color="#F9690E" scale={0.5}><i18n.Translate text="_NAV_BAR_ADMIN_ITEM_LABEL_" /></Label></span>*/}
                                                </Dropdown.Item>
                                            ) : <span></span>}
                                            <Dropdown.Separator></Dropdown.Separator>
                                            <Dropdown.Item onClick={this.onSignoutClick}>
                                                <i18n.Translate text="_NAV_BAR_SIGNOUT_ITEM_LABEL_" />
                                            </Dropdown.Item>
                                        </Dropdown>
                                    </Bar.Item>
                                ) : null}

                                {!user && screenSize != "phone"  ? (
                                    <Bar.Item theme={barItemTheme}>
                                        <Link to="/signin">
                                            <i18n.Translate text="_NAV_BAR_SIGNIN_ITEM_LABEL_" format="upper" />
                                        </Link>
                                    </Bar.Item>
                                ) : null}
                            </Bar.Menu>
                        </Bar.Body>
                    </Bar>

                    <div className={styles.content}>
                        {this.props.children}
                    </div>
                </div>

                {basket.showCard ? (
                    <Basket.Card onClick={this.onBasketCardButtonClick}/>
                ) : null}

                <div className={styles.footer}></div>
            </div>
        );
    }
}

/** Export **/
export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Component));
