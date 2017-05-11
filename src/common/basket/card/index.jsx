/* global mixpanel */

import React from "react";
import {connect} from "react-redux";
import {withRouter} from "react-router";
import lodash from "lodash";
import {LoggerFactory} from "darch/src/utils";
import Button from "darch/src/button";
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
        let {items,totalPrice,totalDiscount} = this.props.basket;
        let {uid,buttonLabel} = this.props;
        let appliedDiscount = totalDiscount > totalPrice ? totalPrice : totalDiscount;
        let totalPriceWithDiscount = totalPrice - appliedDiscount;

        return uid ? (
            <div>
                <div className={styles.card}>
                    {/*list ? (
                        <div className={styles.listNameContainer}>
                            <Label layout="outline" color="moody" scale={0.7}>{list.name}</Label>
                        </div>
                    ) : null*/}

                    <div>
                        <span className={styles.price}><i18n.Number prefix="R$" value={parseFloat(totalPriceWithDiscount.toFixed(2))} numDecimals={2} /></span>
                        <span className={styles.items}>
                            <span className={styles.separator}>/</span>
                            {lodash.size(items) == 1 ? (
                                <i18n.Translate text="_BASKET_CARD_ITEMS_TEXT_" data={{numItems: lodash.size(items)}} />
                            ) : (
                                <i18n.Translate text="_BASKET_CARD_ITEM_TEXT_" data={{numItems: lodash.size(items)}} />
                            )}
                        </span>
                    </div>

                    <div>
                        <Button scale={0.8} block={true} color="success" onClick={this.props.onClick} disabled={!lodash.size(items) || this.props.disabled}>
                            <i18n.Translate text={buttonLabel} />
                        </Button>
                    </div>
                </div>
            </div>
        ) : (
            <div>
                <div className={styles.card}>
                    <div>
                        <Button scale={0.8} block={true} color="success" onClick={this.onGetInivitationBtnClick}>
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

