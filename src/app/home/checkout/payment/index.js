import React from "react"
import lodash from "lodash"
import {withRouter} from "react-router-dom"
import {connect} from "react-redux"
//import classNames from "classnames";
import config from "config"
import moment from "moment"
import {LoggerFactory,Redux,Style} from "darch/src/utils"
import Container from "darch/src/container"
import i18n from "darch/src/i18n"
import Grid from "darch/src/grid"
import Form from "darch/src/form"
import Field from "darch/src/field"
import Button from "darch/src/button"
import Text from "darch/src/text"
import Toaster from "darch/src/toaster"
import Spinner from "darch/src/spinner"
import Calendar from "darch/src/calendar"
import {Api,Basket,Payment,List,Tracker} from "common"
import moipImg from "assets/images/poweredbymoip30px.png"
import styles from "./styles"

let Logger = new LoggerFactory("checkout.payment", {level: "debug"})

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        productData: state.product.data,
        brandData: state.brand.data,
        user: state.user.data[state.user.uid],
        basket: state.basket
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
    static displayName = "checkout.payment";
    static defaultProps = {};
    static propTypes = {};

    state = {
        openModals: {},
        selectedBillingSourceTab: "credit_card",
        recurrence: "none"
    };

    recurrenceOptions = [
        {value: "none", label: "_LIST_SUBSCRIPTION_NONE_RECURRENCE_"},
        {value: "weekly", label: "_LIST_SUBSCRIPTION_WEEKLY_RECURRENCE_"},
        {value: "biweekly", label: "_LIST_SUBSCRIPTION_BIWEEKLY_RECURRENCE_"},
        {value: "monthly", label: "_LIST_SUBSCRIPTION_MONTHLY_RECURRENCE_"}
    ];

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

    async pay() {
        let response,
            {basket} = this.props,
            logger = Logger.create("pay")

        logger.info("enter")

        // Validate
        if(this.state.selectedBillingSourceTab == "credit_card"
        && !lodash.get(basket,"billingSource._id")) {
            return Redux.dispatch(Toaster.actions.push("danger", "_CHECKOUT_STEP_PAYMENT_MISSING_CREDIT_CARD_ERROR_TOAST_MESSAGE_"))
        }
        else if(!lodash.get(basket,"address._id")) {
            return Redux.dispatch(Toaster.actions.push("danger", "_CHECKOUT_STEP_PAYMENT_MISSING_ADDRESS_ERROR_TOAST_MESSAGE_"))
        }
        else if(!lodash.get(basket,"deliverDate")) {
            return Redux.dispatch(Toaster.actions.push("danger", "_CHECKOUT_STEP_PAYMENT_MISSING_DELIVER_DATE_ERROR_TOAST_MESSAGE_"))
        }

        // Set basket as beeing payed
        Redux.dispatch(Basket.actions.basketSetIsPaying(true))

        // Loading
        this.setState({loading: true})

        let {productData,brandData} = this.props
        let brands = {}
        let companies = {}
        let order = {
            totalPrice: basket.totalPrice,
            grossTotalPrice: basket.grossTotalPrice,
            totalFee: basket.totalFee,
            totalDiscount: basket.totalDiscount,
            fees: basket.appliedFees,
            deliverDate: basket.deliverDate,
            items: [],
            address: basket.address
        }

        // Add items to order
        for(let productId of Object.keys(basket.items)) {
            let item = basket.items[productId]
            let product = productData[productId]||null
            let brand = product?brandData[product.brand]:null

            logger.debug("processing item", {
                productId,
                item,
                product,
                brand
            })

            if(!product) {return}

            order.items.push({
                product: item.product,
                priceValue: product.priceValue,
                quantity: item.quantity
            })

            brands[product.brand] = true

            if(brand && brand.company) {
                companies[brand.company] = true
            }
        }

        // Set brands and companies
        order.brands = Object.keys(brands)
        order.companies = Object.keys(companies)

        if(this.state.selectedBillingSourceTab == "pay_on_deliver") {
            order.paymentType = "on_deliver"
            order.status = "payment_authorized"
        }

        // Log
        logger.debug("order data", order)

        // Create the order.
        try {
            response = await Api.shared.orderCreate(order)
            logger.info("api orderCreate success", response)
            order = response.result
        }
        catch(error) {
            logger.error("api orderCreate error", error)
            return this.setState({loading: false})
        }

        if(this.state.selectedBillingSourceTab == "credit_card") {
            // Pay the order right away.
            try {
                response = await Api.shared.orderCharge(order._id, {
                    source: {
                        method: basket.billingSource.method,
                        _id: basket.billingSource._id,
                        hash: basket.billingSource.hash
                    }
                })

                logger.info("api orderCharge success", response)
            }
            catch(error) {
                logger.error("api orderCharge error", error)
                return this.setState({loading: false})
            }   
        }

        Tracker.track("order created", {
            count: order.count,
            totalPrice: order.totalPrice,
            grossTotalPrice: order.grossTotalPrice,
            paymentType: order.paymentType,
            paymentMethod: this.state.selectedBillingSourceTab
        })

        // Create the list
        if(!lodash.isEmpty(this.state.listName)) {
            let list = {
                name: this.state.listName,
                items: []
            }

            for(let productId of Object.keys(basket.items)) {
                list.items.push({
                    product: productId,
                    quantity: basket.items[productId].quantity
                })
            }

            try {
                await Redux.dispatch(
                    List.actions.listCreate(list)
                )

                logger.info("action listCreate success")
            }
            catch(error) {
                logger.error("action listCreate error", error)
            }
        }

        // Generate a list
        /*if(this.state.recurrence) { 
            try {
                await Redux.dispatch(
                    List.actions.listSubscriptionCreate({
                        list: this.props.list._id,
                        recurrence: this.state.recurrence,
                        address: this.state.address,
                        billingSource: this.state.source,
                        delay: 1    // the order gonna be deliverd in delay 0
                    })
                );

                logger.info("list action listSubscriptionCreate success");
            }
            catch(error) {
                logger.error("list action listSubscriptionCreate error", error);
            }
        }*/

        // Go to last step.
        this.props.history.replace({
            pathname: "/checkout/finalize",
            query: {
                oc: order.count
            }
        })
    }

    onBasketButtonClick() {
        let logger = Logger.create("onBasketButtonClick")
        logger.info("enter")
    }

    onRecurrenceOptionSelect(option) {
        return () => {
            this.setState({
                recurrence: option.value
            })
        }
    }

    onAddressSelected(address) {
        Redux.dispatch(Basket.actions.basketSelectAddress(address))
    }

    onSourceTabSelected(tabName) {
        this.setState({selectedBillingSourceTab: tabName})
    }

    onSourceSelected(source) {
        Redux.dispatch(Basket.actions.basketSelectBillingSource(source))
    }

    onDeliverDateSelected(deliverDate) {
        Redux.dispatch(Basket.actions.basketSelectDeliverDate(deliverDate))
    }

    render() {
        let logger = Logger.create("render")
        let {basket} = this.props
        let {screenSize} = this.state

        let allowedWeekdays = lodash.map(lodash.get(config, "shared.order.allowedDeliverWeekdays"), (obj, weekday) => {
            return moment().isoWeekday(weekday).isoWeekday()
        })

        let minimumDaysToDeliver = lodash.get(config, "shared.order.minimumDaysToDeliver")
        let startDeliverMoment = minimumDaysToDeliver > 0 ?
            moment().add(minimumDaysToDeliver, "days") :
            moment()


        let {coupons} = basket
        //let {deliverDateDatetimes} = config.shared.order;

        logger.info("enter", basket)

        return (
            <div className={styles.page}>
                <Container>
                    <Grid>
                        <Grid.Cell span={3}>
                            <div className={styles.bodyContainer}>
                                <h3 style={{marginBottom: "50px"}}><i18n.Translate text="_CHECKOUT_STEP_PAYMENT_TITLE_" /></h3>

                                {/*<div className={styles.separator}></div>*/}

                                <div className={styles.section}>
                                    <Payment.SourceSelectPanel onSourceSelected={this.onSourceSelected}
                                        onTabSelected={this.onSourceTabSelected}
                                        selectedSourceId={lodash.get(basket,"billingSource._id")}
                                        paymentMethods={["credit_card","pay_on_deliver"]}
                                    />
                                </div>

                                <Payment.Separator.Stripped/>

                                <div className={styles.section}>
                                    <Payment.AddressSelectPanel onAddressSelected={this.onAddressSelected} 
                                        selectedAddressId={lodash.get(basket,"address._id")}/>
                                </div>

                                <Payment.Separator.Stripped/>

                                <div className={styles.section}>
                                    <div className="headline" style={{overflow: "auto", "paddingBottom": "10px"}}>
                                        <span><span className="icon-calendar" style={{marginRight: "5px"}}></span>Data de Entrega</span>
                                    </div>

                                    {/*<div style={{marginTop: "10px"}}>
                                        <Text scale={0.8}>Por enquanto só entregamos às quartas e domingos, uma semana após</Text>
                                    </div>*/}

                                    <div style={{marginTop: "10px"}}>
                                        <Calendar scale={0.8}
                                            startDate={startDeliverMoment.toISOString()}
                                            multi={false}
                                            value={lodash.get(basket, "deliverDate")} 
                                            onChange={(value) => {
                                                this.onDeliverDateSelected(value)
                                            }}
                                            allow={(date) => {
                                                let dateMoment = moment(date)
                                                return allowedWeekdays.indexOf(dateMoment.isoWeekday())>=0
                                            }}
                                        />
                                    </div>
                                </div>

                                <Payment.Separator.Stripped/>

                                <div className={styles.section}>
                                    <div className="headline" style={{overflow: "auto", "paddingBottom": "10px"}}>
                                        <span><span className="icon-wish-list" style={{marginRight: "5px"}}></span>Lista</span>
                                    </div>

                                    {/*<div style={{marginTop: "10px"}}>
                                        <Text scale={0.8}>Por enquanto só entregamos às quartas e domingos, uma semana após</Text>
                                    </div>*/}

                                    <div style={{marginTop: "10px"}}>
                                        <Text scale={0.8}>Se você quiser criar uma lista com os items desta compra, basta escolher um nome para ela.</Text>

                                        <div style={{marginTop: "10px"}}>
                                            <Field.Text
                                                name="name"
                                                value={this.state.listName}
                                                onChange={(value) => {
                                                    this.setState({listName: value})
                                                }}
                                                scale={1}
                                                placeholder="minha super lista"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/*<Payment.Separator.Stripped/>

                                <div className={styles.section}>
                                    <div className="headline" style={{overflow: "auto", "paddingBottom": "10px"}}>
                                        <span><span className="icon-marker" style={{marginRight: "5px"}}></span>Recorrência</span>
                                    </div>

                                    <div style={{marginTop: "10px"}}>
                                        <div style={{marginBottom: "10px"}}>
                                            <Text scale={0.8}>
                                                A recorrência determina de quanto em quanto tempo iremos lhe entregar esta lista.
                                            </Text>
                                        </div>

                                        <Grid spots={5}>
                                            {this.recurrenceOptions.map((recurrenceOption) => {
                                                return (
                                                    <Grid.Cell key={recurrenceOption.value}>
                                                        <div className={classNames([
                                                            styles.panel,
                                                            styles.panelCard,
                                                            recurrence == recurrenceOption.value ? styles.active : ""
                                                        ])} onClick={this.onRecurrenceOptionSelect(recurrenceOption)}>
                                                            <i18n.Translate text={recurrenceOption.label} />
                                                        </div>
                                                    </Grid.Cell>
                                                );
                                            })}
                                        </Grid>
                                    </div>
                                </div>*/}

                                <div className={styles.separator}></div>

                                <div className={styles.section}>
                                    <div className="headline" style={{"paddingBottom": "10px"}}>
                                        <span className="icon-ticket" style={{marginRight: "5px"}}></span>Cupom de Desconto
                                    </div>

                                    <div className={styles.couponsContainer} style={{marginTop: "20px",}}>
                                        <Form onSubmit={this.onCouponFormSubmit}>
                                            <Grid noGap={true}>
                                                <Grid.Cell span={2}>
                                                    <Field.Text
                                                        name="nameId"
                                                        scale={screenSize == "phone"?1:0.8}
                                                        placeholder="#meucupomfodao"
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
                                                    return <Label key={coupon._id} color="success" scale={0.6}>{coupon.nameId}</Label>
                                                })
                                            ) : (
                                                <Text scale={0.8}><b>nenhum</b></Text>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Grid.Cell>

                        <Grid.Cell>
                            {screenSize != "phone" ? (
                                <div className={styles.sidebarContainer}>
                                    <Basket.SideBar
                                        loading={this.state.loading}
                                        loadingComponent={<Spinner.CircSide color="white" />}
                                        buttonLabel="_CHECKOUT_STEP_PAYMENT_BASKET_SIDEBAR_BUTTON_LABEL_"
                                        onButtonClick={this.pay}
                                        showDetails={true}
                                    />
                                    <div style={{textAlign: "right", marginTop: "10px"}}>
                                        <img src={moipImg} />
                                    </div>
                                </div>
                            ) : null}  
                        </Grid.Cell>
                    </Grid>
                </Container>
            </div>
        )
    }
}

/** Export **/
export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Component))

