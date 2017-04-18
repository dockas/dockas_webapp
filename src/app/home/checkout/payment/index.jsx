import React from "react";
import {withRouter} from "react-router";
import {connect} from "react-redux";
import {LoggerFactory} from "darch/src/utils";
import Container from "darch/src/container";
import i18n from "darch/src/i18n";
import {Paypal} from "common";
import styles from "./styles";

let Logger = new LoggerFactory("checkout.payment");

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        user: state.user.profiles[state.user.uid],
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
    static displayName = "checkout.payment";
    static defaultProps = {};
    static propTypes = {};

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");
    }

    onBasketButtonClick() {
        let logger = Logger.create("onBasketButtonClick");
        logger.info("enter");
    }

    onPaymentComplete() {
        let logger = Logger.create("onPaymentComplete");
        logger.info("enter");

        this.props.router.replace("/checkout/finalize");
    }

    render() {
        let logger = Logger.create("render");
        let {user,basket} = this.props;

        logger.info("enter", basket);

        return (
            <div className={styles.page}>
                <Container>
                    <h3><i18n.Translate text="_CHECKOUT_STEP_PAYMENT_TITLE_" /></h3>

                    <i18n.Translate text="_CHECKOUT_STEP_PAYMENT_PAYPAL_DISCLAIMER_" />

                    <div className={styles.paypalBtnContainer}>
                        <Paypal value={parseFloat(basket.totalPrice.toFixed(2))} 
                            user={user}
                            selectedAddress={basket.address}
                            onComplete={this.onPaymentComplete} />
                    </div>
                </Container>

                {/*<Basket.Card onClick={this.onBasketButtonClick} buttonLabel="_BASKET_CARD_PAY_BUTTON_TEXT_" />*/}
            </div>
        );
    }
}

/** Export **/
export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Component));

