import React from "react";
import lodash from "lodash";
import {withRouter} from "react-router";
import {connect} from "react-redux";
import classNames from "classnames";
import {LoggerFactory,Redux,Style} from "darch/src/utils";
import Container from "darch/src/container";
import i18n from "darch/src/i18n";
import Grid from "darch/src/grid";
import Tabs from "darch/src/tabs";
import Form from "darch/src/form";
import Field from "darch/src/field";
import Button from "darch/src/button";
import Text from "darch/src/text";
import Toaster from "darch/src/toaster";
import Spinner from "darch/src/spinner";
import {Api,Basket} from "common";
import moipImg from "assets/images/poweredbymoip30px.png";
import CardModal from "./card_modal";
import AddressModal from "./address_modal";
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

    state = {
        openModals: {},
        selectedBillingSourceTab: "credit_card"
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

    handleWindowResize() {
        let logger = Logger.create("handleWindowResize");

        let {screenSize} = this.state;
        let currentScreenSize = Style.screenForWindowWidth(window.innerWidth);

        if(currentScreenSize != screenSize) {
            logger.info("enter", {screenSize, currentScreenSize});
            this.setState({screenSize: currentScreenSize});
        }
    }

    async pay() {
        let response,
            logger = Logger.create("pay order");

        logger.info("enter");

        // Validate
        if(this.state.selectedBillingSourceTab == "credit_card"
        && !this.state.selectedCreditCardId) {
            return Redux.dispatch(Toaster.actions.push("danger", "_CHECKOUT_STEP_PAYMENT_MISSING_CREDIT_CARD_ERROR_TOAST_MESSAGE_"));
        }
        else if(!this.state.selectedAddressId) {
            return Redux.dispatch(Toaster.actions.push("danger", "_CHECKOUT_STEP_PAYMENT_MISSING_ADDRESS_ERROR_TOAST_MESSAGE_"));
        }

        this.setState({loading: true});

        let address = lodash.find(this.props.user.addresses || [], (address) => {
            return address._id == this.state.selectedAddressId;
        });

        let items = this.props.basket.items;
        let order = {
            totalPrice: this.props.basket.totalPrice,
            items: [],
            address
        };

        // Add items to order
        for(let key of Object.keys(items)) {
            order.items.push({
                product: items[key].product._id,
                priceValue: items[key].product.priceValue,
                quantity: items[key].quantity
            });
        }

        logger.debug("order data", order);

        // Create the order.
        try {
            response = await Api.shared.orderCreate(order);
            logger.info("api orderCreate success", response);
            order = response.result;
        }
        catch(error) {
            logger.error("api orderCreate error", error);
            return this.setState({loading: false});
        }

        // Pay the order right away.
        try {
            response = await Api.shared.orderCharge(order._id, {
                source: {
                    method: "credit_card",
                    _id: this.state.selectedCreditCardId
                }
            });

            logger.info("api orderCharge success", response);
        }
        catch(error) {
            logger.error("api orderCharge error", error);
            return this.setState({loading: false});
        }

        // Go to last step.
        this.props.router.replace({
            pathname: "/checkout/finalize",
            query: {
                oc: order.count
            }
        });
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

        //console.log("PAYMENT COMPLETE 1", order);

        // Add items to order
        for(let key of Object.keys(items)) {
            order.items.push({
                product: items[key].product._id,
                priceValue: items[key].product.priceValue,
                quantity: items[key].quantity
            });
        }

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

    openModal(modalName) {
        let logger = Logger.create("openModal");
        logger.info("enter", {modalName});

        this.setState({
            openModals: Object.assign({}, this.state.openModals, {
                [modalName]: true
            })
        });
    }

    onModalDismiss(modalName) {
        let logger = Logger.create("onModalDismiss");
        logger.info("enter", {modalName});

        this.setState({
            openModals: Object.assign({}, this.state.openModals, {
                [modalName]: false
            })
        });
    }

    onModalComplete(data, modalName) {
        let logger = Logger.create("onModalComplete");
        logger.info("enter", {data,modalName});

        this.setState({
            openModals: Object.assign({}, this.state.openModals, {
                [modalName]: false
            })
        });
    }

    selectAddress(address) {
        return () => {
            this.setState({selectedAddressId: address._id});
        };
    }

    selectCreditCard(card) {
        return () => {
            this.setState({selectedCreditCardId: card._id});
        };
    }

    getCardIcon(card) {
        let iconName;

        switch(card.brand) {
            case "VISA": iconName = "icon-card-visa"; break;
            case "MASTERCARD": iconName = "icon-card-mastercard"; break;
            case "AMEX": iconName = "icon-card-amex"; break;
            default: iconName = "icon-bank-card"; break;
        }

        return <span className={iconName} />;
    }

    selectBillingSourceTab(tabName) {
        return () => {
            this.setState({selectedBillingSourceTab: tabName});
        };
    }

    renderCreditCardTab() {
        let {user} = this.props;
        let {selectedCreditCardId} = this.state;
        let billingSources = user.billingSources || [];

        return billingSources.length ? (
            <Grid spots={5}>
                {billingSources.map((source) => {
                    return source.method == "credit_card" ? (
                        <Grid.Cell key={source._id}>
                            <div className={classNames([
                                styles.panel,
                                styles.panelCard,
                                selectedCreditCardId == source._id ? styles.active : ""
                            ])} onClick={this.selectCreditCard(source)}>
                                <div className={styles.body}>
                                    {this.getCardIcon(source)} <span style={{marginLeft: "5px"}}>••••{source.lastDigits}</span>
                                </div>
                            </div>
                        </Grid.Cell>
                    ) : <span></span>;
                })}
            </Grid>
        ) : (
            <Text scale={0.8}>Nenhum cartão de crédito cadastrado. Clique no botão <b>Adicionar</b> para cadastrar um novo cartão.</Text>
        );
    }

    renderBankSlipTab() {
        return (
            <Text scale={0.8}>Em breve</Text>
        );
    }

    render() {
        let logger = Logger.create("render");
        let {user,basket} = this.props;
        let {screenSize,selectedAddressId,selectedBillingSourceTab} = this.state;
        let {coupons} = basket;
        
        let addresses = user.addresses || [];

        logger.info("enter", basket);

        return (
            <div className={styles.page}>
                <Container>
                    <Grid>
                        <Grid.Cell span={3}>
                            <div className={styles.bodyContainer}>
                                <h3 style={{marginBottom: "50px"}}><i18n.Translate text="_CHECKOUT_STEP_PAYMENT_TITLE_" /></h3>

                                {/*<div className={styles.separator}></div>*/}

                                <div className={styles.section}>
                                    <div className={styles.paymentMethodsTabsContainer}>
                                        <Tabs>
                                            <Tabs.Item active={selectedBillingSourceTab=="credit_card"} onClick={this.selectBillingSourceTab("credit_card")}>
                                                <span className="icon-bank-cards" style={{marginRight: "5px"}}></span> Cartão de Crédito
                                            </Tabs.Item>
                                            <Tabs.Item active={selectedBillingSourceTab=="bank_slip"} onClick={this.selectBillingSourceTab("bank_slip")}>
                                                <span className="icon-barcode" style={{marginRight: "5px"}}></span> Boleto
                                            </Tabs.Item>
                                            {selectedBillingSourceTab=="credit_card"?(
                                                <Tabs.Item align="right" onClick={()=>{this.openModal("card_modal");}}>
                                                    <Text color="moody">Adicionar</Text>
                                                </Tabs.Item>
                                            ) : <span></span>}
                                        </Tabs>
                                    </div>

                                    <div className={styles.paymentMethodsBody} style={{marginTop: "10px"}}>
                                        {selectedBillingSourceTab=="credit_card" ? (
                                            this.renderCreditCardTab()
                                        ) : selectedBillingSourceTab=="bank_slip" ? (
                                            this.renderBankSlipTab()
                                        ) : null}
                                    </div>
                                </div>

                                <div className={styles.separator}></div>

                                <div className={styles.section}>
                                    <div className="headline" style={{overflow: "auto", "paddingBottom": "10px"}}>
                                        <span><span className="icon-marker" style={{marginRight: "5px"}}></span>Endereço de Entrega</span>
                                        <div style={{float: "right"}}>
                                            <a onClick={()=>{this.openModal("address_modal");}}><Text color="moody">Adicionar</Text></a>
                                        </div>
                                    </div>

                                    <div style={{marginTop: "10px"}}>
                                        {addresses.length ? addresses.map((address) => {
                                            return (
                                                <div key={address._id} className={classNames([
                                                    styles.panel,
                                                    styles.addressPanel,
                                                    selectedAddressId == address._id ? styles.active : ""
                                                ])} onClick={this.selectAddress(address)}>
                                                    <div className={styles.title}>{address.label}</div>
                                                    <div className={styles.body}>{address.street}, {address.number} - {address.neighborhood}</div>
                                                </div>
                                            );
                                        }) : (
                                            <Text scale={0.8}>Nenhum endereço cadastrado. Clique no botão <b>Adicionar</b> para cadastrar um novo endereço.</Text>
                                        )}
                                    </div>
                                </div>

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
                                                    return <Label key={coupon._id} color="success" scale={0.6}>{coupon.nameId}</Label>;
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
                                    />
                                    <div style={{textAlign: "right", marginTop: "10px"}}>
                                        <img src={moipImg} />
                                    </div>
                                </div>
                            ) : null}  
                        </Grid.Cell>
                    </Grid>
                </Container>

                <CardModal open={this.state.openModals["card_modal"]} onDismiss={this.onModalDismiss} onComplete={this.onModalComplete} />
                <AddressModal open={this.state.openModals["address_modal"]} onDismiss={this.onModalDismiss} onComplete={this.onModalComplete} />
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

