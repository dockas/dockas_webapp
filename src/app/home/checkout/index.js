import React from "react"
import classNames from "classnames"
import {connect} from "react-redux"
import {withRouter} from "react-router-dom"
import {LoggerFactory,Redux} from "darch/src/utils"
import i18n from "darch/src/i18n"
import canCheckoutPol from "policies/can_checkout"
import {Basket,Product,RouterUtil} from "common"
import styles from "./styles"

let Logger = new LoggerFactory("checkout.page")

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
    static displayName = "checkout.page";
    static defaultProps = {};
    static propTypes = {};

    async componentDidMount() {
        let notFetchedProductIds = [],
            fetchedProducts = [],
            {productData,basket,history} = this.props,
            logger = Logger.create("componentDidMount")

        logger.info("enter")

        // preload subroutes
        RouterUtil.preloadRoutes(this.props)

        // Show basket card
        Redux.dispatch(Basket.actions.basketSetShowCard(false))

        // Initialize
        try {
            await canCheckoutPol(history)
        }
        catch(error) {
            return logger.error("authPol error", error)
        }

        // Get not fetched product ids.
        for(let productId of Object.keys(basket.items)) {
            if(!productData[productId]) {
                notFetchedProductIds.push(productId)
            }
            else {
                fetchedProducts.push(productData[productId])
            }
        }

        // Fetch not fetched products.
        if(notFetchedProductIds.length) {
            Redux.dispatch(
                Product.actions.productFind({_id: notFetchedProductIds}, {
                    populate: {paths: ["mainProfileImage"]}
                })
            )
        }

        // Ensure that fetched products has necessary data.
        if(fetchedProducts.length) {
            Product.populator.populate(fetchedProducts, {
                paths: ["mainProfileImage"]
            })
        }

        this.setState({initialized: true})
    }

    render() {
        let {initialized} = this.state
        let {pathname} = this.props.location

        return initialized ? (
            <div className={styles.page}>
                <ul className={styles.progressSteps}>
                    <li className={pathname=="/checkout"?styles.active:""}>
                        <div className={styles.stepContainer}>
                            <div className={styles.stepBullete}></div>
                        </div>
                        <div className={styles.stepTitle}>
                            <i18n.Translate text="_CHECKOUT_PROGRESS_STEP_REVIEW_TEXT_" />
                        </div>
                    </li>
                    {/*<li className={pathname=="/checkout/address"?styles.active:""}>
                        <div className={styles.stepContainer}>
                            <div className={classNames([styles.stepBar, styles.stepBarLeft])}></div>
                            <div className={styles.stepBullete}></div>
                        </div>
                        <div className={styles.stepTitle}>
                            <i18n.Translate text="_CHECKOUT_PROGRESS_STEP_ADDRESS_TEXT_" />
                        </div>
                    </li>*/}
                    <li className={pathname=="/checkout/payment"?styles.active:""}>
                        <div className={styles.stepContainer}>
                            <div className={classNames([styles.stepBar, styles.stepBarLeft])}></div>
                            <div className={styles.stepBullete}></div>
                        </div>
                        <div className={styles.stepTitle}>
                            <i18n.Translate text="_CHECKOUT_PROGRESS_STEP_PAYMENT_TEXT_" />
                        </div>
                    </li>
                    <li className={pathname=="/checkout/finalize"?styles.active:""}>
                        <div className={styles.stepContainer}>
                            <div className={classNames([styles.stepBar, styles.stepBarLeft])}></div>
                            <div className={styles.stepBullete}></div>
                        </div>
                        <div className={styles.stepTitle}>
                            <i18n.Translate text="_CHECKOUT_PROGRESS_STEP_FINALIZE_TEXT_" />
                        </div>
                    </li>
                </ul>

                {RouterUtil.renderRoutes(this.props)}
            </div>
        ) : null
    }
}

/** Export **/
export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Component))
