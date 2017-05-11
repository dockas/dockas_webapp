import React from "react";
import lodash from "lodash";
import {withRouter} from "react-router";
import {connect} from "react-redux";
import {LoggerFactory,Redux} from "darch/src/utils";
import Container from "darch/src/container";
import i18n from "darch/src/i18n";
import Spinner from "darch/src/spinner";
import {Api,Paypal,Basket} from "common";
import styles from "./styles";

let Logger = new LoggerFactory("checkout.payment", {level: "debug"});

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

    state = {};

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");
    }

    onBasketButtonClick() {
        let logger = Logger.create("onBasketButtonClick");
        logger.info("enter");
    }

    async onPaymentComplete(data) {
        let logger = Logger.create("onPaymentComplete");
        logger.info("enter", data);

        // Create order
        this.setState({loading: true});

        let items = this.props.basket.items;
        let order = {
            totalPrice: this.props.basket.totalPrice,
            address: this.props.basket.address.id,
            items: [],
            paypal: {
                id: data.id,
                state: data.state,
                paymentMethod: lodash.get(data, "payer.payment_method"),
                allData: JSON.stringify(data)
            }
        };

        console.log("PAYMENT COMPLETE 1", order);

        // Add items to order
        for(let key of Object.keys(items)) {
            order.items.push({
                product: items[key].product._id,
                priceValue: items[key].product.priceValue,
                count: items[key].count
            });
        }

        console.log("PAYMENT COMPLETE 2", order);

        // Create order
        try {
            let orderCreateResponse = await Api.shared.orderCreate(order);
            logger.info("api orderCreate success", orderCreateResponse);
        }
        catch(error) {
            logger.error("api orderCreate error", error);
            this.setState({loading: false});
        }

        // Clear the basket
        Redux.dispatch(Basket.actions.basketClear());

        // Redirect to success page
        this.props.router.replace("/checkout/finalize");
    }

    render() {
        let logger = Logger.create("render");
        let {user,basket} = this.props;
        let {totalPrice,totalDiscount} = basket;
        let appliedDiscount = totalDiscount > totalPrice ? totalPrice : totalDiscount;
        let totalPriceWithDiscount = totalPrice - appliedDiscount;

        logger.info("enter", basket);

        return (
            <div className={styles.page}>
                <Container>
                    <h3><i18n.Translate text="_CHECKOUT_STEP_PAYMENT_TITLE_" /></h3>

                    <i18n.Translate text="_CHECKOUT_STEP_PAYMENT_PAYPAL_DISCLAIMER_" />

                    {this.state.loading ? (
                        <div className={styles.loadingContainer}>
                            <i18n.Translate text="_FINALIZING_" />
                            <span className={styles.spinnerContainer}>
                                <Spinner.CircSide color="moody" />
                            </span>
                        </div>
                    ) : (
                        <div className={styles.paypalBtnContainer}>
                            <Paypal value={parseFloat(totalPriceWithDiscount.toFixed(2))} 
                                user={user}
                                selectedAddress={basket.address}
                                onComplete={this.onPaymentComplete} />
                        </div>
                    )}
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

