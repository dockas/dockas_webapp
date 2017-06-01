import React from "react";
import config from "config";
import {withRouter} from "react-router";
import {connect} from "react-redux";
import {LoggerFactory,Style} from "darch/src/utils";
import i18n from "darch/src/i18n";
import Button from "darch/src/button";
import Text from "darch/src/text";
import numberUtils from "darch/src/field/number/utils";
import styles from "./styles";

let Logger = new LoggerFactory("basket.sidebar");

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
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
    static displayName = "basket.sidebar";
    static defaultProps = {
        buttonLabel: "_CHECKOUT_STEP_REVIEW_CONTINUE_BUTTON_LABEL_",
        onButtonClick: () => {},
        loading: false,
        loadingComponent: (<span>Loading ...</span>)
    };
    static propTypes = {
        buttonLabel: React.PropTypes.string,
        onButtonClick: React.PropTypes.func,
        loading: React.PropTypes.bool,
        loadingComponent: React.PropTypes.element
    };

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

    onBasketButtonClick() {
        this.props.onButtonClick();
    }

    render() {
        let {minOrderTotalPrice} = config.shared;
        let {basket,spec,loading,loadingComponent} = this.props;
        let {totalPrice,totalDiscount} = basket;
        let appliedDiscount = totalDiscount > totalPrice ? totalPrice : totalDiscount;
        let totalPriceWithDiscount = totalPrice - appliedDiscount;

        let priceLowerThanMin = (totalPrice < minOrderTotalPrice);

        return (
            <div className={styles.sidebar}>
                <div className={styles.sidebarContainer}>
                    <div className={styles.checkoutBox}>
                        <h4 className={styles.title}>RESUMO</h4>

                        {appliedDiscount > 0 ? (
                            <div className={styles.discountInfoContainer}>
                                <div className={styles.originalTotalPriceContainer}>
                                    <Text scale={0.8}>
                                        <u>preço</u>: <i18n.Number prefix="R$" value={parseFloat((totalPrice/100).toFixed(2))} numDecimals={2} />
                                    </Text>
                                </div>

                                <div className={styles.appliedDiscountContainer}>
                                    <Text scale={0.8}>
                                        <u>desconto</u>: <i18n.Number prefix="R$" value={parseFloat((appliedDiscount/100).toFixed(2))} numDecimals={2} />
                                    </Text>
                                </div>
                            </div>
                        ) : null}

                        <div className={styles.totalPriceContainer}>
                            <div>
                                <Text scale={0.8}><u>total</u>:</Text>
                            </div>

                            <div className={styles.priceValue}>
                                <i18n.Number prefix="R$" value={parseFloat((totalPriceWithDiscount/100).toFixed(2))} numDecimals={2} />
                            </div>
                        </div>

                        <div className={styles.buttonContainer}>
                            <Button block={true} color="success" onClick={this.onBasketButtonClick} disabled={priceLowerThanMin}>
                                {!priceLowerThanMin ? (
                                    <i18n.Translate text={this.props.buttonLabel} />
                                ) : !loading ? (
                                    <i18n.Translate text="_BASKET_CARD_PRICE_LOWER_THAN_MIN_MESSAGE_" data={{
                                        minOrderTotalPrice: numberUtils.parseModelToView(spec,minOrderTotalPrice/100).value,
                                        diff: (minOrderTotalPrice - totalPrice)/100
                                    }} />
                                ) : loadingComponent}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Component));
