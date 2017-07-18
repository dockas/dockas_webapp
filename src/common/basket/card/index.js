import React from "react"
import PropTypes from "prop-types"
import {connect} from "react-redux"
import {withRouter} from "react-router-dom"
import lodash from "lodash"
//import config from "config";
import {LoggerFactory,Style} from "darch/src/utils"
import Button from "darch/src/button"
//import numberUtils from "darch/src/field/number/utils";
//import Label from "darch/src/label";
//import Modal from "darch/src/modal";
import i18n from "darch/src/i18n"
import Tracker from "common/utils/tracker"
import styles from "./styles"

let Logger = new LoggerFactory("common.product.card")

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
        spec: state.i18n.spec,
        user: state.user.uid?state.user.data[state.user.uid]:null
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
    static displayName = "common.basket.card";
    
    static defaultProps = {
        onClick: () => {},
        buttonLabel: "_BASKET_CARD_FINALIZE_BUTTON_TEXT_",
        disabled: false
    };
    
    static propTypes = {
        onClick: PropTypes.func.isRequired,
        disabled: PropTypes.bool,
        buttonLabel: PropTypes.string,
    };

    state = {};

    /**
     * LYFECICLE : This function is called when component
     * got mounted in the view.
     */
    componentDidMount() {
        let logger = Logger.create("componentDidMount")
        logger.info("enter")

        // Add class to body signalizing that basket card is visible.
        if(document.body.className.indexOf("basket-card-visible") < 0) {
            document.body.className += " basket-card-visible"
        }

        window.addEventListener("resize", this.handleWindowResize)

        this.handleWindowResize()
    }

    componentWillUnmount() {
        document.body.className = document.body.className.replace(/ basket-card-visible/g,"")
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

    onGetInivitationBtnClick() {
        let logger = Logger.create("onGetInivitationBtnClick")
        logger.info("enter")

        Tracker.track("get invitation button clicked")

        this.props.history.push("invitation")
    }

    /**
     * This function is responsible for generating the component's view.
     */
    render() {
        //let {minTotalPrice} = config.shared.order;
        let {screenSize} = this.state
        let {items,grossTotalPrice} = this.props.basket
        let {uid,buttonLabel} = this.props
        //let isAdmin = user&&user.roles.indexOf("admin")>=0;

        //let priceLowerThanMin = (grossTotalPrice < minTotalPrice);

        return uid ? (
            <div>
                <div className={styles.card}>
                    {/*list ? (
                        <div className={styles.listNameContainer}>
                            <Label layout="outline" color="moody" scale={0.7}>{list.name}</Label>
                        </div>
                    ) : null*/}

                    {/*grossTotalPrice != totalPrice ? (
                        <div className={styles.totalWithFees}>
                            <span style={{fontWeight: "600"}}><i18n.Number prefix="R$" value={parseFloat((totalPrice/100).toFixed(2))} numDecimals={2} /></span> c/ taxas
                        </div>
                    ) : null*/}

                    <div>
                        <span className={styles.price}><i18n.Number prefix="R$" value={parseFloat((grossTotalPrice/100).toFixed(2))} numDecimals={2} /></span>
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
                        <Button scale={screenSize != "phone" ? 0.8 : 1} block={true} color="success" onClick={this.props.onClick} disabled={!lodash.size(items) || this.props.disabled}>
                            <i18n.Translate text={buttonLabel} />

                            {/*isAdmin||!priceLowerThanMin ? (
                                <i18n.Translate text={buttonLabel} />
                            ) : (
                                <i18n.Translate text="_BASKET_CARD_PRICE_LOWER_THAN_MIN_MESSAGE_" data={{
                                    minTotalPrice: numberUtils.parseModelToView(spec,minTotalPrice/100).value,
                                    diff: (minTotalPrice - grossTotalPrice)/100
                                }} />
                            )*/}
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
        )
    }
}

/** Export **/
export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Component))

