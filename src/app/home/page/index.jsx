import React from "react";
import classNames from "classnames";
import {Link,withRouter} from "react-router";
import {connect} from "react-redux";
import {LoggerFactory} from "darch/src/utils";
import i18n from "darch/src/i18n";
import Bar from "darch/src/bar";
import Dropdown from "darch/src/dropdown";
import logoIcon from "assets/images/logo_icon_80x80.png";
import styles from "./styles";
import {Basket} from "common";

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
        
        this.props.router.push("/checkout");
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

                            {user && user.role == "admin" ? (
                                <Bar.Item>
                                    <Link to="/create/product" className={styles.createButton}>
                                        <i18n.Translate text="_NAV_BAR_CREATE_PRODUCT_ITEM_LABEL_" />
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
                                        <Dropdown.Item to="account">Perfil</Dropdown.Item>
                                        <Dropdown.Separator></Dropdown.Separator>
                                        <Dropdown.Item onClick={this.onLogoutClick}>Logout</Dropdown.Item>
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

                {(/^\/checkout/).test(pathname) ? null : (
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
