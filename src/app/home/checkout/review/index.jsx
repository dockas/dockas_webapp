import React from "react";
import lodash from "lodash";
import {withRouter} from "react-router";
import {connect} from "react-redux";
import config from "config";
import {LoggerFactory, Redux, Style} from "darch/src/utils";
import i18n from "darch/src/i18n";
import Button from "darch/src/button";
import Container from "darch/src/container";
import Grid from "darch/src/grid";
import Text from "darch/src/text";
import Form from "darch/src/form";
import Field from "darch/src/field";
import numberUtils from "darch/src/field/number/utils";
import Toaster from "darch/src/toaster";
import Label from "darch/src/label";
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
        basket: state.basket,
        spec: state.i18n.spec
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

    state = {};

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        window.addEventListener("resize", this.handleWindowResize);

        this.handleWindowResize();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleWindowResize);
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

    onCouponFormSubmit(data) {
        let logger = Logger.create("onCouponFormSubmit");
        logger.info("enter", data);

        let {coupons} = this.props.basket;

        if(coupons[data.nameId]) {
            return Redux.dispatch(
                Toaster.actions.push("danger", "_CHECKOUT_STEP_REVIEW_COUPON_ALREADY_APPLIED_TOAST_MESSAGE_")
            );
        }

        // Let's apply the coupon.
        Redux.dispatch(
            Basket.actions.basketApplyCoupon(data.nameId)
        );
    }

    render() {
        let {minOrderTotalPrice} = config.shared;
        let {screenSize} = this.state;
        let {basket,spec} = this.props;
        let {totalPrice,totalDiscount,coupons} = basket;
        let appliedDiscount = totalDiscount > totalPrice ? totalPrice : totalDiscount;
        let totalPriceWithDiscount = totalPrice - appliedDiscount;

        let priceLowerThanMin = (totalPrice < minOrderTotalPrice);

        //console.log(["screen size", screenSize]);

        return (
            <div className={styles.page}>
                <Container>
                    <Grid>
                        <Grid.Cell span={3}>
                            <div className={styles.bodyContainer}>
                                <h3><i18n.Translate text="_CHECKOUT_STEP_REVIEW_TITLE_" /></h3>

                                <div className={styles.couponsContainer}>
                                    <Form onSubmit={this.onCouponFormSubmit}>
                                        <Grid noGap={true}>
                                            <Grid.Cell span={2}>
                                                <Field.Text
                                                    name="nameId"
                                                    scale={screenSize == "phone"?1:0.8}
                                                    placeholder="cupom de desconto"
                                                />
                                            </Grid.Cell>

                                            <Grid.Cell>
                                                <Button scale={screenSize == "phone"?1:0.8} block={true} type="submit">aplicar</Button>
                                            </Grid.Cell>
                                        </Grid>
                                    </Form>

                                    <div className={styles.appliedCouponsContainer}>
                                        <span className={styles.title}>aplicados :</span>{lodash.size(coupons) ? (
                                            lodash.map(coupons, (coupon) => {
                                                return <Label key={coupon._id} color="success" scale={0.6}>{coupon.nameId}</Label>;
                                            })
                                        ) : (
                                            <Text scale={0.8}><b>nenhum</b></Text>
                                        )}
                                    </div>
                                </div>

                                <div className={styles.itemsContainer}>
                                    <div className="table-container">
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
                                                    let mainImage = lodash.find(item.product.images, (image) => {
                                                        return image._id == item.product.mainImage;
                                                    });

                                                    return (
                                                        <tr key={item.product._id}>
                                                            <td>
                                                                {mainImage ? (
                                                                    <div className={styles.image} style={{
                                                                        backgroundImage: `url(//${config.hostnames.file}/images/${mainImage.path})`,
                                                                        backgroundSize: "cover",
                                                                        backgroundPosition: "center"
                                                                    }}></div>
                                                                ) : null}
                                                                
                                                                {item.product.name}
                                                            </td>
                                                            <td><i18n.Number value={item.product.priceValue} numDecimals={2} currency={true} /></td>
                                                            <td>{item.count}</td>
                                                            <td><i18n.Number value={item.count * item.product.priceValue} numDecimals={2} currency={true} /></td>
                                                            <td>
                                                                <Button onClick={this.onRemoveButtonClick(item.product)} color="danger" scale={0.8}>-1</Button>
                                                                <Button onClick={this.onAddButtonClick(item.product)} color="moody" scale={0.8}>+1</Button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </Grid.Cell>

                        <Grid.Cell>
                            {screenSize != "phone" ? (
                                <div className={styles.sidebarContainer}>
                                    <div className={styles.checkoutBox}>
                                        <h4 className={styles.title}>RESUMO</h4>

                                        {appliedDiscount > 0.00 ? (
                                            <div className={styles.discountInfoContainer}>
                                                <div className={styles.originalTotalPriceContainer}>
                                                    <Text scale={0.8}>
                                                        <u>preço</u>: <i18n.Number prefix="R$" value={parseFloat(totalPrice.toFixed(2))} numDecimals={2} />
                                                    </Text>
                                                </div>

                                                <div className={styles.appliedDiscountContainer}>
                                                    <Text scale={0.8}>
                                                        <u>desconto</u>: <i18n.Number prefix="R$" value={parseFloat(appliedDiscount.toFixed(2))} numDecimals={2} />
                                                    </Text>
                                                </div>
                                            </div>
                                        ) : null}

                                        <div className={styles.totalPriceContainer}>
                                            <div>
                                                <Text scale={0.8}><u>total</u>:</Text>
                                            </div>

                                            <div className={styles.priceValue}>
                                                <i18n.Number prefix="R$" value={parseFloat((totalPriceWithDiscount).toFixed(2))} numDecimals={2} />
                                            </div>
                                        </div>

                                        <div className={styles.buttonContainer}>
                                            <Button block={true} color="success" onClick={this.onBasketButtonClick} disabled={priceLowerThanMin}>
                                                {!priceLowerThanMin ? (
                                                    <i18n.Translate text="_CHECKOUT_STEP_REVIEW_CONTINUE_BUTTON_LABEL_" />
                                                ) : (
                                                    <i18n.Translate text="_BASKET_CARD_PRICE_LOWER_THAN_MIN_MESSAGE_" data={{
                                                        minOrderTotalPrice: numberUtils.parseModelToView(spec,minOrderTotalPrice).value,
                                                        diff: (minOrderTotalPrice - totalPrice)
                                                    }} />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ) : null}        
                        </Grid.Cell>
                    </Grid>
                </Container>

                {screenSize == "phone" ? (
                    <Basket.Card onClick={this.onBasketButtonClick} buttonLabel="_BASKET_CARD_CONTINUE_BUTTON_TEXT_" />
                ) : null}
            </div>
        );
    }
}

/** Export **/
export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Component));