/* global mixpanel */

import React from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router";
import lodash from "lodash";
import config from "config";
import {LoggerFactory,Style} from "darch/src/utils";
import Button from "darch/src/button";
import numberUtils from "darch/src/field/number/utils";
//import Label from "darch/src/label";
//import Modal from "darch/src/modal";
import i18n from "darch/src/i18n";
import styles from "./styles";

let Logger = new LoggerFactory("common.product.card");

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        uid: state.user.uid,
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
    static displayName = "common.basket.card";
    
    static defaultProps = {
        onClick: () => {},
        buttonLabel: "_BASKET_CARD_FINALIZE_BUTTON_TEXT_",
        disabled: false
    };
    
    static propTypes = {
        onClick: React.PropTypes.func.isRequired,
        disabled: React.PropTypes.bool,
        buttonLabel: React.PropTypes.string,
    };

    state = {};

    /**
     * LYFECICLE : This function is called when component
     * got mounted in the view.
     */
    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        // Add class to body signalizing that basket card is visible.
        if(document.body.className.indexOf("basket-card-visible") < 0) {
            document.body.className += " basket-card-visible";
        }

        window.addEventListener("resize", this.handleWindowResize);

        this.handleWindowResize();
    }

    componentWillUnmount() {
        document.body.className = document.body.className.replace(/ basket-card-visible/g,"");
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

    onGetInivitationBtnClick() {
        let logger = Logger.create("onGetInivitationBtnClick");
        logger.info("enter");

        mixpanel.track("get invitation button clicked");

        this.props.router.push("invitation");
    }

    /**
     * This function is responsible for generating the component's view.
     */
    render() {
        let {minOrderTotalPrice} = config.shared;
        let {screenSize} = this.state;
        let {items,totalPrice,totalDiscount} = this.props.basket;
        let {uid,buttonLabel,spec} = this.props;
        let appliedDiscount = totalDiscount > totalPrice ? totalPrice : totalDiscount;
        let totalPriceWithDiscount = totalPrice - appliedDiscount;

        let priceLowerThanMin = (totalPrice < minOrderTotalPrice);

        return uid ? (
            <div>
                <div className={styles.card}>
                    {/*list ? (
                        <div className={styles.listNameContainer}>
                            <Label layout="outline" color="moody" scale={0.7}>{list.name}</Label>
                        </div>
                    ) : null*/}

                    <div>
                        <span className={styles.price}><i18n.Number prefix="R$" value={parseFloat((totalPriceWithDiscount/100).toFixed(2))} numDecimals={2} /></span>
                        <span className={styles.items}>
                            <span className={styles.separator}>/</span>
                            {lodash.size(items) == 1 ? (
                                <i18n.Translate text="_BASKET_CARD_ITEM_TEXT_" data={{numItems: lodash.size(items)}} />
                            ) : (
                                <i18n.Translate text="_BASKET_CARD_ITEMS_TEXT_" data={{numItems: lodash.size(items)}} />
                            )}
                        </span>
                    </div>

                    <div>
                        <Button scale={screenSize != "phone" ? 0.8 : 1} block={true} color="success" onClick={this.props.onClick} disabled={priceLowerThanMin || !lodash.size(items) || this.props.disabled}>
                            {!priceLowerThanMin ? (
                                <i18n.Translate text={buttonLabel} />
                            ) : (
                                <i18n.Translate text="_BASKET_CARD_PRICE_LOWER_THAN_MIN_MESSAGE_" data={{
                                    minOrderTotalPrice: numberUtils.parseModelToView(spec,minOrderTotalPrice/100).value,
                                    diff: (minOrderTotalPrice - totalPrice)/100
                                }} />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        ) : (
            <div>
                <div className={styles.card}>
                    <div>
                        <Button scale={screenSize != "phone" ? 0.8 : 1} color="success" onClick={this.onGetInivitationBtnClick}>
                            <i18n.Translate text="_BASKET_CARD_INVITATION_BUTTON_TEXT_" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }
}

/** Export **/
export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Component));

