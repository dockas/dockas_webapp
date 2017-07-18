import React from "react"
import lodash from "lodash"
import {withRouter} from "react-router-dom"
import {connect} from "react-redux"
import classNames from "classnames"
import config from "config"
import {LoggerFactory, Redux, Style} from "darch/src/utils"
import i18n from "darch/src/i18n"
import Button from "darch/src/button"
import Container from "darch/src/container"
import Grid from "darch/src/grid"
//import Text from "darch/src/text";
//import Form from "darch/src/form";
//import Field from "darch/src/field";
//import numberUtils from "darch/src/field/number/utils";
import Toaster from "darch/src/toaster"
//import Label from "darch/src/label";
import {Basket} from "common"
import styles from "./styles"

let Logger = new LoggerFactory("checkout.review")

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        productData: state.product.data,
        fileData: state.file.data,
        user: state.user.uid?state.user.data[state.user.uid]:null,
        basket: state.basket,
        spec: state.i18n.spec
    }
}

/**
 * Redux dispatch to props map.
 */
let mapDispatchToProps = {
    
}

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
        let logger = Logger.create("componentDidMount")
        logger.info("enter")

        window.addEventListener("resize", this.handleWindowResize)
        this.handleWindowResize()
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleWindowResize)
    }

    handleWindowResize() {
        let logger = Logger.create("handleWindowResize")

        let {screenSize} = this.state
        let currentScreenSize = Style.screenForWindowWidth(window.innerWidth)

        if(currentScreenSize != screenSize) {
            logger.info("enter", {screenSize, currentScreenSize})
            this.setState({screenSize: currentScreenSize})
        }
    }

    onAddButtonClick(product) {
        return () => {
            Redux.dispatch(
                Basket.actions.basketAddProduct(product)
            )
        }
    }

    onRemoveButtonClick(product) {
        return () => {
            Redux.dispatch(
                Basket.actions.basketRemoveProduct(product)
            )
        }
    }

    onBasketButtonClick() {
        let logger = Logger.create("onBasketButtonClick")
        logger.info("enter")
        
        // Go to payment
        this.props.history.push("/checkout/payment")
    }

    onCouponFormSubmit(data) {
        let logger = Logger.create("onCouponFormSubmit")
        logger.info("enter", data)

        let {coupons} = this.props.basket

        if(coupons[data.nameId]) {
            return Redux.dispatch(
                Toaster.actions.push("danger", "_CHECKOUT_STEP_REVIEW_COUPON_ALREADY_APPLIED_TOAST_MESSAGE_")
            )
        }

        // Let's apply the coupon.
        Redux.dispatch(
            Basket.actions.basketApplyCoupon(data.nameId)
        )
    }

    render() {
        let {screenSize} = this.state
        let {basket,productData,fileData} = this.props

        return (
            <div className={styles.page}>
                <Container>
                    <Grid>
                        <Grid.Cell span={3}>
                            <div className={styles.bodyContainer}>
                                <h3><i18n.Translate text="_CHECKOUT_STEP_REVIEW_TITLE_" /></h3>

                                {/*<div className={styles.couponsContainer}>
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
                                </div>*/}

                                <div className={styles.itemsContainer}>
                                    <div className="table-container">
                                        <table className={classNames([
                                            "table",
                                            styles.table
                                        ])}>
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
                                                {lodash.map(basket.items, (item) => {
                                                    //console.log(["basket item bocozao", item]);

                                                    let product = lodash.get(productData, item.product)||{}
                                                    let mainProfileImage = lodash.get(fileData, product.mainProfileImage)

                                                    return (
                                                        <tr key={item.product}>
                                                            <td className={styles.nameCell}>
                                                                {mainProfileImage ? (
                                                                    <div className={styles.image} style={{
                                                                        backgroundImage: `url(//${config.hostnames.file}/images/${mainProfileImage.path})`,
                                                                        backgroundSize: "cover",
                                                                        backgroundPosition: "center"
                                                                    }}></div>
                                                                ) : null}
                                                                
                                                                {product.name}
                                                            </td>
                                                            <td><i18n.Number value={(product.priceValue||0)/100} numDecimals={2} currency={true} /></td>
                                                            <td>{item.quantity}</td>
                                                            <td><i18n.Number value={(item.quantity * (product.priceValue||0))/100} numDecimals={2} currency={true} /></td>
                                                            <td>
                                                                <Button onClick={this.onRemoveButtonClick(product)} color="danger" scale={0.8}>-1</Button>
                                                                <Button onClick={this.onAddButtonClick(product)} color="moody" scale={0.8}>+1</Button>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </Grid.Cell>

                        <Grid.Cell>
                            {screenSize != "phone" ? (
                                <Basket.SideBar
                                    buttonLabel="_CHECKOUT_STEP_REVIEW_CONTINUE_BUTTON_LABEL_"
                                    onButtonClick={this.onBasketButtonClick}
                                    showDetails={false}
                                />
                            ) : null}        
                        </Grid.Cell>
                    </Grid>
                </Container>

                {screenSize == "phone" ? (
                    <Basket.Card onClick={this.onBasketButtonClick} buttonLabel="_BASKET_CARD_CONTINUE_BUTTON_TEXT_" />
                ) : null}
            </div>
        )
    }
}

/** Export **/
export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Component))