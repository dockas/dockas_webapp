import React from "react"
import lodash from "lodash"
import moment from "moment"
import {connect} from "react-redux"
import config from "config"
import {LoggerFactory,Redux} from "darch/src/utils"
//import Container from "darch/src/container";
import i18n from "darch/src/i18n"
import Label from "darch/src/label"
import Spinner from "darch/src/spinner"
//import Button from "darch/src/button";
//import Tabs from "darch/src/tabs";
import {Order,OrderItem} from "common"
//import Bar from "../bar";
import styles from "./styles"

let Logger = new LoggerFactory("admin.orders")

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        productData: state.product.data,
        userData: state.user.data,
        orderData: state.order.data,
        orderItemData: state.orderItem.data,
        fileData: state.file.data,
        orderScopeIds: lodash.get(state.order,"scope.adminOrders.ids"),
        orderScopeQuery: lodash.get(state.order,"scope.adminOrders.query")
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
    static displayName = "admin.orders.list";
    static defaultProps = {};
    static propTypes = {};

    state = {
        withinWeek: true,
        onlyOpen: true
    };

    statusSequence = [
        Order.types.Status.PAYMENT_PENDING,
        Order.types.Status.PAYMENT_AUTHORIZED,
        Order.types.Status.PACKAGED,
        Order.types.Status.DELIVERING,
        Order.types.Status.DELIVERED
    ];

    statusIconClassMap = {
        [Order.types.Status.PAYMENT_PENDING]: "icon-circled-new",
        [Order.types.Status.PAYMENT_AUTHORIZED]: "icon-circled-dollar",
        [Order.types.Status.PACKAGED]: "icon-circled-box",
        [Order.types.Status.DELIVERING]: "icon-circled-truck",
        [Order.types.Status.DELIVERED]: "icon-circled-ok"
    };

    getScopeData(props=this.props) {
        let brand,
            nameId = lodash.get(props, "params.id"),
            {brandData,brandNameIdToId} = props

        brand = brandNameIdToId[nameId] ?
            brandData[brandNameIdToId[nameId]] : 
            null

        return {brand}
    }

    async componentDidMount() {
        let logger = Logger.create("componentDidMount")
        logger.info("enter")

        this.loadOrders()
    }

    async loadOrders() {
        let {withinWeek,onlyOpen} = this.state,
            logger = Logger.create("loadOrders")

        this.setState({loadingOrders: true})

        let query = {
            status: [ // all but delivered
                Order.types.Status.PAYMENT_PENDING,
                Order.types.Status.PAYMENT_AUTHORIZED,
                Order.types.Status.PACKAGED,
                Order.types.Status.DELIVERING
            ],
            sort: {"deliverDate": -1, "statusPriority": -1}
        }

        if(!onlyOpen) {
            query.status.push(Order.types.Status.DELIVERED)
        }

        if(withinWeek) {
            query.deliverDate = {
                gte: moment().startOf("isoWeek").startOf("day").toISOString(), // from last saturday
                lte: moment().endOf("isoWeek").endOf("day").toISOString() // to next friday
            }
        }

        try {
            let result = Redux.dispatch(Order.actions.orderFind(query, {
                scope: {id: "adminOrders"},
                populate: {
                    paths: ["user","items","items[].product", "items[].product.mainProfileImage"]
                }
            }))

            logger.info("action orderFind success", result)
        }
        catch(error) {
            logger.error("action orderFind error", error)
        }

        this.setState({loadingOrders: false})
    }

    onStatusUpdateClick(order, targetStatus) {
        return () => {
            let logger = Logger.create("onStatusUpdateClick")

            let orderStatusSeq = this.statusSequence.indexOf(order.status)
            let targetStatusSeq = this.statusSequence.indexOf(targetStatus)

            logger.info("enter", {orderStatusSeq,targetStatusSeq})

            // Prevent pass direct to a gratter status.
            if(order.paymentType == "default" && targetStatusSeq != orderStatusSeq+1){return}

            Redux.dispatch(Order.actions.orderStatusUpdate(order._id, targetStatus))
        }
    }

    isStatusActive(targetStatus, orderStatus) {
        let logger = Logger.create("getStatusClassName")
        logger.info("enter", {orderStatus,targetStatus})

        let targetStatusSeq = this.statusSequence.indexOf(targetStatus)
        let orderStatusSeq = this.statusSequence.indexOf(orderStatus)

        logger.debug("seq", {orderStatusSeq, targetStatusSeq})

        // Activate when targetStatus is behind current orderStatus.
        if(targetStatusSeq <= orderStatusSeq) {
            return true
        }

        return false
    }

    setItemStatus(item, status) {
        return async () => {
            let logger = Logger.create("setItemStateForProduct")
            logger.info("enter", {item,status})

            let result = await Redux.dispatch(
                OrderItem.actions.orderItemUpdate(item._id, {status})
            )

            logger.info("action orderItemUpdate success", result)

            /*try {
                let result = await Redux.dispatch(
                    OrderItem.action.orderItemUpdate(item._id, {status})
                );

                logger.info("action orderItemUpdate success", result);
            }
            catch(error) {
                logger.error("action orderItemUpdate error", error);
            }*/
        }
    }

    renderOrdersTable() {
        let {orderData, userData, orderScopeIds} = this.props

        return (
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th><i18n.Translate text="_ADMIN_ORDERS_PAGE_USER_TH_" /></th>
                            <th><i18n.Translate text="_ADMIN_ORDERS_PAGE_ADDRESS_TH_" /></th>
                            <th><i18n.Translate text="_ADMIN_ORDERS_PAGE_PRICE_VALUE_TH_" /></th>
                            <th><i18n.Translate text="_ADMIN_ORDERS_PAGE_DELIVER_DATE_TH_" /></th>
                            <th><i18n.Translate text="_ADMIN_ORDERS_PAGE_STATUS_TH_" /></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {orderScopeIds && orderScopeIds.length ? (
                            orderScopeIds.map((orderId) => {
                                let order = orderData[orderId]
                                let user = lodash.get(userData, lodash.get(order, "user"))||{}
                                let phoneAreaCode = lodash.get(order, "address.phone.areaCode")||"" 
                                let phoneNumber = lodash.get(order, "address.phone.number")||""
                                let phone = phoneAreaCode&&phoneNumber?`${phoneAreaCode}${phoneNumber}`:null

                                return order ? (
                                    <tr key={order._id}>
                                        <td>{user.fullName}</td>
                                        <td>{order.address.street}, {order.address.number} {order.address.complement||""} - {order.address.neighborhood} (<u>{phone}</u>)</td>
                                        <td style={{whiteSpace: "nowrap"}}><i18n.Number prefix="R$" numDecimals={2} value={order.totalPrice/100} /></td>
                                        <td>
                                            <i18n.Moment date={order.deliverDate} format="date" />
                                        </td>
                                        
                                        <td>{order.status}</td>
                                        
                                        <td className={styles.buttonsContainer}>
                                            {this.statusSequence.map((status) => {
                                                let isActive = this.isStatusActive(status, order.status)
                                                let isDisabled = isActive || [
                                                    Order.types.Status.PAYMENT_PENDING,
                                                    Order.types.Status.PAYMENT_AUTHORIZED
                                                ].indexOf(status) >= 0

                                                return order.paymentType != "on_deliver" || status != Order.types.Status.PAYMENT_AUTHORIZED ? (
                                                    <a key={status} title={i18n.utils.translate({text: `_ORDER_STATUS_${lodash.toUpper(status)}_`})} className={isActive?styles.active:""} disabled={isDisabled} onClick={this.onStatusUpdateClick(order, status)}>
                                                        <span className={this.statusIconClassMap[status]}></span>
                                                    </a>
                                                ) : <span key={status}></span>
                                            })}
                                        </td>
                                    </tr>
                                ) : <tr key={orderId}></tr>
                            })
                        ) : null}
                    </tbody>
                </table>
            </div>
        )
    }

    renderProductsTable() {
        let logger = Logger.create("renderProductsTable")
        let {orderItemData,orderData,productData,fileData,orderScopeIds} = this.props
        let items = []

        logger.info("enter")

        for(let orderId of orderScopeIds||[]) {
            let order = orderData[orderId]

            logger.debug("order", order)

            if(!order){continue}

            for(let itemId of order.items) {
                let item = orderItemData[itemId]

                if(!item){continue}

                logger.debug("item", item)

                items.push(item)
            }
        }

        //console.log(["renderProductsTable : result products", products]);

        // Sort items
        items = lodash.orderBy(items, [(item) => {
            return ["stocket","ready","pending"].indexOf(item.status)
        }, (item) => {
            return item.pickupDate
        }], ["desc", "desc"])

        console.log(["renderProductsTable : final items", items])

        return (
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th></th>
                            <th><i18n.Translate text="_ADMIN_ORDERS_PAGE_PRODUCT_PICKUP_DATE_TH_" /></th>
                            <th><i18n.Translate text="_ADMIN_ORDERS_PAGE_PRODUCT_NAME_TH_" /></th>
                            <th><i18n.Translate text="_ADMIN_ORDERS_PAGE_PRODUCT_COUNT_TH_" /></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length ? (
                            lodash.map(items, (item) => {
                                let product = productData[item.product]
                                let productMainProfileImage = product ?
                                    fileData[product.mainProfileImage] :
                                    null

                                return product ? (
                                    <tr key={`${item.order}:${item.product}`}>
                                        <td>
                                            {productMainProfileImage ? (
                                                <div className={styles.productImage} style={{
                                                    backgroundImage: `url(//${config.hostnames.file}/images/${productMainProfileImage.path})`,
                                                    backgroundSize: "cover",
                                                    backgroundPosition: "center"
                                                }}></div>
                                            ) : null}
                                        </td>
                                        <td>
                                            {product.supplyType == "on_demand" ? (
                                                <i18n.Moment date={item.pickupDate} format="date" />
                                            ) : "-"}
                                        </td>
                                        <td>{product.name}</td>
                                        <td>{item.quantity}</td>

                                        <td>
                                            {product.supplyType == "on_demand" ? (
                                                item.status == "pending" ? (
                                                    <Label color="#eeeeee" scale={0.8}>{item.status}</Label>
                                                ) : item.status == "ready" ? (
                                                    <Label color="moody" scale={0.8} onClick={this.setItemStatus(item, "stocked")}>{item.status}</Label>
                                                ) : item.status == "stocked" ? (
                                                    <Label color="#F9690E" scale={0.8}>{item.status}</Label>
                                                ) : null
                                            ) : (
                                                <Label color="#F9690E" scale={0.8}>stocked</Label>
                                            )}
                                        </td>
                                    </tr>
                                ) : (
                                    <tr key={`${item.order}:${item.product}`}></tr>
                                )
                            })
                        ) : null}
                    </tbody>
                </table>
            </div>
        )
    }

    render() {
        let {loadingOrders,onlyOpen,withinWeek,showProducts} = this.state

        console.log(["render admin orders", this.props.orders])

        return (
            <div>
                <h2 style={{marginTop: "30px"}}>
                    <i18n.Translate text="_ADMIN_ORDERS_PAGE_TITLE_" /><span style={{marginLeft: "15px"}}><Label color="#F9690E" scale={0.8} layout="outlined">admin</Label></span>
                </h2>

                <div className={styles.filtersContainer}>
                    {loadingOrders ? (<Spinner.CircSide scale={0.8} color="moody" />) : null}

                    <Label scale={0.8} color={showProducts?"moody":"#eeeeee"} onClick={() => {this.setState({showProducts: !showProducts})}}>
                        <i18n.Translate text="_ADMIN_ORDERS_PAGE_FILTER_ONLY_PRODUCTS_" />
                    </Label>

                    <Label scale={0.8} color={withinWeek?"moody":"#eeeeee"} onClick={() => {this.setState({withinWeek: !withinWeek}, this.loadOrders)}}>
                        <i18n.Translate text="_ADMIN_ORDERS_PAGE_FILTER_WITHIN_WEEK_ORDERS_" />
                    </Label>

                    <Label scale={0.8} color={onlyOpen?"moody":"#eeeeee"} onClick={() => {this.setState({onlyOpen: !onlyOpen}, this.loadOrders)}}>
                        <i18n.Translate text="_ADMIN_ORDERS_PAGE_FILTER_OPEN_ORDERS_" />
                    </Label>
                </div>

                {showProducts ? this.renderProductsTable() : this.renderOrdersTable()}
            </div>
        )
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component)

