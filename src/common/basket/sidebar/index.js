import React from "react"
import PropTypes from "prop-types"
//import config from "config";
import {withRouter} from "react-router-dom"
import {connect} from "react-redux"
import {LoggerFactory,Style} from "darch/src/utils"
import i18n from "darch/src/i18n"
import Button from "darch/src/button"
import Text from "darch/src/text"
//import numberUtils from "darch/src/field/number/utils";
import styles from "./styles"

let Logger = new LoggerFactory("basket.sidebar")

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
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
    static displayName = "basket.sidebar";
    static defaultProps = {
        buttonLabel: "_CHECKOUT_STEP_REVIEW_CONTINUE_BUTTON_LABEL_",
        onButtonClick: () => {},
        loading: false,
        loadingComponent: (<span>Loading ...</span>),
        showDetails: false
    };
    static propTypes = {
        buttonLabel: PropTypes.string,
        onButtonClick: PropTypes.func,
        loading: PropTypes.bool,
        loadingComponent: PropTypes.element,
        showDetails: PropTypes.bool
    };

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

    onBasketButtonClick() {
        this.props.onButtonClick()
    }

    render() {
        //let {minTotalPrice} = config.shared.order;
        let {basket,loading,loadingComponent,showDetails} = this.props
        let {grossTotalPrice,totalPrice,totalDiscount,totalFee} = basket
        //let isAdmin = user&&user.roles.indexOf("admin")>=0;

        //let priceLowerThanMin = (grossTotalPrice < minTotalPrice);

        return (
            <div className={styles.sidebar}>
                <div className={styles.sidebarContainer}>
                    <div className={styles.checkoutBox}>
                        <h4 className={styles.title}>RESUMO</h4>

                        {showDetails && (totalDiscount > 0 || totalFee > 0) ? (
                            <div className={styles.detailContainer}>
                                <div className={styles.priceDetailContainer}>
                                    <Text scale={0.8}>
                                        <u>preço</u>: <i18n.Number prefix="R$" value={parseFloat((grossTotalPrice/100).toFixed(2))} numDecimals={2} />
                                    </Text>
                                </div>

                                {totalDiscount > 0 ? (
                                    <div className={styles.priceDetailContainer}>
                                        <Text scale={0.8}>
                                            <u>desconto</u>: <i18n.Number prefix="R$" value={parseFloat((totalDiscount/100).toFixed(2))} numDecimals={2} />
                                        </Text>
                                    </div>
                                ) : null}

                                {totalFee > 0 ? (
                                    <div className={styles.priceDetailContainer}>
                                        <Text scale={0.8}>
                                            <u>entrega</u>: <i18n.Number prefix="R$" value={parseFloat((totalFee/100).toFixed(2))} numDecimals={2} />
                                        </Text>
                                    </div>
                                ) : null}
                            </div>
                        ) : null}

                        <div className={styles.totalPriceContainer}>
                            <div>
                                <Text scale={0.8}><u>total</u>:</Text>
                            </div>

                            <div className={styles.priceValue}>
                                <i18n.Number prefix="R$" value={parseFloat(((showDetails?totalPrice:grossTotalPrice)/100).toFixed(2))} numDecimals={2} />
                            </div>
                        </div>

                        <div className={styles.buttonContainer}>
                            <Button block={true} color="success" onClick={this.onBasketButtonClick} disabled={loading}>
                                {loading ? (
                                    loadingComponent
                                ) : (
                                    <i18n.Translate text={this.props.buttonLabel} />
                                )}

                                {/*loading ? (
                                    loadingComponent
                                ) : isAdmin||!priceLowerThanMin ? (
                                    <i18n.Translate text={this.props.buttonLabel} />
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
            </div>
        )
    }
}

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Component))
