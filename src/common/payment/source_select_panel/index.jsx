import React from "react";
import {connect} from "react-redux";
import classNames from "classnames";
//import lodash from "lodash";
//import config from "config";
import {LoggerFactory} from "darch/src/utils";
import Tabs from "darch/src/tabs";
//import Field from "darch/src/field";
import Grid from "darch/src/grid";
import Text from "darch/src/text";
import CardModal from "../card_modal";
import styles from "./styles";

let Logger = new LoggerFactory("common.payment.source_selec_panel");

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        uid: state.user.uid,
        user: state.user.uid?state.user.data[state.user.uid]:null
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
    static displayName = "common.payment.source_select_panel";
    static defaultProps = {
        onSourceSelected: () => {},
        onSourceCreated: () => {},
        onTabSelected: () => {},
        autoSelect: true,
        paymentMethods: ["credit_card"]
    };
    static propTypes = {
        onSourceSelected: React.PropTypes.func,
        onSourceCreated: React.PropTypes.func,
        onTabSelected: React.PropTypes.func,
        autoSelect: React.PropTypes.bool,
        selectedSourceId: React.PropTypes.string,
        paymentMethods: React.PropTypes.arrayOf(
            React.PropTypes.oneOf([
                "credit_card",
                "bank_slip",
                "pay_on_deliver"
            ])
        )
    };

    state = {
        openModals: {},
        selectedBillingSourceTab: "credit_card"
    };

    async componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");
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
        this.setState({
            openModals: Object.assign({}, this.state.openModals, {
                [modalName]: false
            })
        });
    }

    onModalComplete(data, modalName) {
        this.setState({
            openModals: Object.assign({}, this.state.openModals, {
                [modalName]: false
            })
        }, () => {
            this.props.onSourceCreated(data, modalName);
        });
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
            this.setState({selectedBillingSourceTab: tabName}, () => {
                this.props.onTabSelected(tabName);
            });
        };
    }

    selectCreditCard(card) {
        return () => {
            this.props.onSourceSelected(card, "credit_card");
        };
    }

    renderCreditCardTab() {
        let {user,selectedSourceId} = this.props;
        let billingSources = user.billingSources || [];

        if(billingSources.length == 1 
        && !selectedSourceId
        && this.props.autoSelect) {
            setTimeout(() => {
                this.selectCreditCard(billingSources[0])();
            }, 100);
        }

        console.log(["billingSources capiroto", billingSources]);

        return billingSources && billingSources.length ? (
            <div>
                <Grid spots={5}>
                    {billingSources.map((source) => {
                        return source.method == "credit_card" ? (
                            <Grid.Cell key={source._id}>
                                <div className={classNames([
                                    styles.box,
                                    selectedSourceId == source._id ? styles.active : ""
                                ])} onClick={this.selectCreditCard(source)}>
                                    <div className={styles.body}>
                                        {this.getCardIcon(source)} <span style={{marginLeft: "5px"}}>••••{source.lastDigits}</span>
                                    </div>
                                </div>
                            </Grid.Cell>
                        ) : <span key={source._id}></span>;
                    })}
                </Grid>
            </div>
        ) : (
            <Text scale={0.8}>Nenhum cartão de crédito cadastrado. Clique no botão <b>Adicionar</b> para cadastrar um novo cartão.</Text>
        );
    }

    renderBankSlipTab() {
        return (
            <Text scale={0.8}>Em breve</Text>
        );
    }

    renderPayOnDeliverTab() {
        return (
            <div>
                <Text scale={0.8}><b>Atenção:</b> No momento, aceitamos apenas os cartões VISA, MASTERCARD e ELO para pagamentos na entrega.</Text>
            </div>
        );
    }

    render() {
        let {selectedBillingSourceTab} = this.state;
        let {paymentMethods} = this.props;

        return (
            <div className={styles.panel}>
                <div className={styles.paymentMethodsTabsContainer}>
                    <Tabs>
                        {paymentMethods.indexOf("credit_card") >= 0 ? (
                            <Tabs.Item active={selectedBillingSourceTab=="credit_card"} onClick={this.selectBillingSourceTab("credit_card")}>
                                <span className="icon-bank-cards" style={{marginRight: "5px"}}></span> Cartão de Crédito
                            </Tabs.Item>
                        ) : null}

                        {paymentMethods.indexOf("bank_slip") >= 0 ? (
                            <Tabs.Item active={selectedBillingSourceTab=="bank_slip"} onClick={this.selectBillingSourceTab("bank_slip")}>
                                <span className="icon-barcode" style={{marginRight: "5px"}}></span> Boleto
                            </Tabs.Item>
                        ) : null}

                        {paymentMethods.indexOf("pay_on_deliver") >= 0 ? (
                            <Tabs.Item active={selectedBillingSourceTab=="pay_on_deliver"} onClick={this.selectBillingSourceTab("pay_on_deliver")}>
                                <span className="icon-delivery-truck" style={{marginRight: "5px"}}></span> Pagar na Entrega
                            </Tabs.Item>
                        ) : null}

                        {selectedBillingSourceTab=="credit_card"?(
                            <Tabs.Item align="right">
                                <a onClick={()=>{this.openModal("credit_card_modal");}}>
                                    <Text color="moody">Adicionar</Text>
                                </a>
                            </Tabs.Item>
                        ) : <span></span>}
                    </Tabs>
                </div>

                <div className={styles.paymentMethodsBody} style={{marginTop: "10px"}}>
                    {selectedBillingSourceTab=="credit_card" ? (
                        this.renderCreditCardTab()
                    ) : selectedBillingSourceTab=="bank_slip" ? (
                        this.renderBankSlipTab()
                    ) : selectedBillingSourceTab=="pay_on_deliver" ? (
                        this.renderPayOnDeliverTab()
                    ) : null}
                </div>

                <CardModal name="credit_card_modal" open={this.state.openModals["credit_card_modal"]} onDismiss={this.onModalDismiss} onComplete={this.onModalComplete} />
            </div>
        );
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component);