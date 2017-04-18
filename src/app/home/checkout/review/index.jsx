import React from "react";
import lodash from "lodash";
import {withRouter} from "react-router";
import {connect} from "react-redux";
import config from "config";
import {LoggerFactory, Redux} from "darch/src/utils";
import i18n from "darch/src/i18n";
import Button from "darch/src/button";
import Container from "darch/src/container";
import {Basket} from "common";
import styles from "./styles";

let Logger = new LoggerFactory("checkout.review");

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
    static displayName = "checkout.review";
    static defaultProps = {};
    static propTypes = {};

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");
    }

    onAddButtonClick(product) {
        return () => {
            Redux.dispatch(
                Basket.actions.basketAddProduct(product)
            );
        };
    }

    onRemoveButtonClick(product) {
        return () => {
            Redux.dispatch(
                Basket.actions.basketRemoveProduct(product)
            );
        };
    }

    onBasketButtonClick() {
        let logger = Logger.create("onBasketButtonClick");
        logger.info("enter");
        
        // If user are not logged, then prompt it to login or to
        // create an account.
        if(!this.props.user) {
            this.props.router.push({
                pathname: "/signin",
                query: {redirect: "/checkout/address"}
            });
        }
        else {
            this.props.router.push("/checkout/address");
        }
    }

    render() {
        return (
            <div className={styles.page}>
                <Container>
                    <h3><i18n.Translate text="_CHECKOUT_STEP_REVIEW_TITLE_" /></h3>

                    <table>
                        <thead>
                            <tr>
                                <th><i18n.Translate text="_CHECKOUT_STEP_REVIEW_PRODUCT_NAME_TH_" /></th>
                                <th><i18n.Translate text="_CHECKOUT_STEP_REVIEW_UNIT_PRICE_TH_" /></th>
                                <th><i18n.Translate text="_CHECKOUT_STEP_REVIEW_COUNT_TH_" /></th>
                                <th><i18n.Translate text="_CHECKOUT_STEP_REVIEW_TOTAL_PRICE_TH_" /></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {lodash.map(this.props.basket.items, (item) => {
                                return (
                                    <tr key={item.product._id}>
                                        <td>
                                            <div className={styles.image} style={{
                                                backgroundImage: `url(http://${config.hostnames.file}/${item.product.image})`,
                                                backgroundSize: "cover",
                                                backgroundPosition: "center"
                                            }}></div>
                                            
                                            {item.product.summary}
                                        </td>
                                        <td><i18n.Number value={item.product.price} numDecimals={2} currency={true} /></td>
                                        <td>{item.count}</td>
                                        <td><i18n.Number value={item.count * item.product.price} numDecimals={2} currency={true} /></td>
                                        <td>
                                            <Button onClick={this.onRemoveButtonClick(item.product)} color="danger" scale={0.8}>-1</Button>
                                            <Button onClick={this.onAddButtonClick(item.product)} color="moody" scale={0.8}>+1</Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </Container>

                <Basket.Card onClick={this.onBasketButtonClick} buttonLabel="_BASKET_CARD_CONTINUE_BUTTON_TEXT_" />
            </div>
        );
    }
}

/** Export **/
export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Component));