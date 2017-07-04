import React from "react";
import lodash from "lodash";
import moment from "moment";
import {connect} from "react-redux";
import config from "config";
import {LoggerFactory,Redux} from "darch/src/utils";
import Container from "darch/src/container";
import i18n from "darch/src/i18n";
import Label from "darch/src/label";
import Spinner from "darch/src/spinner";
//import Button from "darch/src/button";
//import Tabs from "darch/src/tabs";
import {Order,Api} from "common";
//import Bar from "../bar";
import styles from "./styles";

let Logger = new LoggerFactory("admin.orders.list");

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
        fileData: state.file.data,
        orderScopeIds: lodash.get(state.order,"scope.adminOrders.ids"),
        orderScopeQuery: lodash.get(state.order,"scope.adminOrders.query")
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
    static displayName = "admin.orders.list";
    static defaultProps = {};
    static propTypes = {};

    state = {};

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
            {brandData,brandNameIdToId} = props;

        brand = brandNameIdToId[nameId] ?
            brandData[brandNameIdToId[nameId]] : 
            null;

        return {brand};
    }

    async componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        Redux.dispatch(Order.actions.orderFind({
            status: [ // all but delivered
                Order.types.Status.PAYMENT_PENDING,
                Order.types.Status.PAYMENT_AUTHORIZED,
                Order.types.Status.PACKAGED,
                Order.types.Status.DELIVERING
            ],
            deliverDate: {
                gte: moment().startOf("isoWeek").startOf("day").toISOString(), // from last saturday
                lte: moment().endOf("isoWeek").endOf("day").toISOString() // to next friday
            },
            sort: {"deliverDate": 1}
        }, {
            scope: {id: "adminOrders"},
            populate: {
                paths: ["user","items[].product", "items[].product.mainProfileImage"]
            }
        }));
    }

    onStatusUpdateClick(order, targetStatus) {
        return () => {
            let logger = Logger.create("onStatusUpdateClick");

            let orderStatusSeq = this.statusSequence.indexOf(order.status);
            let targetStatusSeq = this.statusSequence.indexOf(targetStatus);

            logger.info("enter", {orderStatusSeq,targetStatusSeq});

            // Prevent pass direct to a gratter status.
            if(order.paymentType == "default" && targetStatusSeq != orderStatusSeq+1){return;}

            Redux.dispatch(Order.actions.orderStatusUpdate(order._id, targetStatus));
        };
    }

    isStatusActive(targetStatus, orderStatus) {
        let logger = Logger.create("getStatusClassName");
        logger.info("enter", {orderStatus,targetStatus});

        let targetStatusSeq = this.statusSequence.indexOf(targetStatus);
        let orderStatusSeq = this.statusSequence.indexOf(orderStatus);

        logger.debug("seq", {orderStatusSeq, targetStatusSeq});

        // Activate when targetStatus is behind current orderStatus.
        if(targetStatusSeq <= orderStatusSeq) {
            return true;
        }

        return false;
    }

    setItemStateForProduct(productId, status) {
        return async () => {
            let {orderData,orderScopeIds} = this.props,
                logger = Logger.create("setItemStateForProduct");
            logger.info("enter", {productId,status});

            let promises = [];

            // Let's update items assotiated with product in all orders.
            for(let orderId of orderScopeIds||[]) {
                let order = orderData[orderId];

                if(!order){continue;}

                for(let item of order.items) {
                    if(item.product != productId) {continue;}

                    promises.push(Api.shared.orderItemStatusUpdate(order._id, productId, status));
                }
            }

            try {
                let results = await Promise.all(promises);
                logger.info("api orderItemStatusUpdate all success", results);
            }
            catch(error) {
                logger.error("api orderItemStatusUpdate all error", error);
            }
        };
    }

    renderOrdersTable() {
        let {orderData, userData, orderScopeIds} = this.props;

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
                                let order = orderData[orderId];
                                let user = lodash.get(userData, lodash.get(order, "user"));
                                let phoneAreaCode = lodash.get(order, "address.phone.areaCode")||""; 
                                let phoneNumber = lodash.get(order, "address.phone.number")||"";
                                let phone = phoneAreaCode&&phoneNumber?`${phoneAreaCode}${phoneNumber}`:null;

                                return order ?(
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
                                                let isActive = this.isStatusActive(status, order.status);
                                                let isDisabled = isActive || [Order.types.Status.PAYMENT_PENDING,Order.types.Status.PAYMENT_AUTHORIZED].indexOf(status) >= 0;

                                                return order.paymentType != "on_deliver" || status != Order.types.Status.PAYMENT_AUTHORIZED ? (
                                                    <a key={status} title={i18n.utils.translate({text: `_ORDER_STATUS_${lodash.toUpper(status)}_`})} className={isActive?styles.active:""} disabled={isDisabled} onClick={this.onStatusUpdateClick(order, status)}>
                                                        <span className={this.statusIconClassMap[status]}></span>
                                                    </a>
                                                ) : <span key={status}></span>;
                                            })}
                                        </td>
                                    </tr>
                                ) : <tr key={orderId}></tr>;
                            })
                        ) : null}
                    </tbody>
                </table>
            </div>
        );
    }

    renderProductsTable() {
        let logger = Logger.create("renderProductsTable");
        let {orderData,productData,fileData,orderScopeIds} = this.props;
        let products = {};

        logger.info("enter");

        for(let orderId of orderScopeIds||[]) {
            let order = orderData[orderId];

            logger.debug("order", order);

            if(!order){continue;}

            let pickupDate = (order.pickupDate?moment(pickupDate):moment(order.deliverDate).subtract(1, "day")).format("YYYY-MM-DD");

            logger.debug("pickupDate", {pickupDate});

            for(let item of order.items) {
                let product = productData[item.product];

                if(!product){continue;}

                logger.debug("product", product);

                //console.log(["item",item]);
                products[item.status] = products[item.status]||{};
                products[item.status][pickupDate] = products[item.status][pickupDate] || {};
                products[item.status][pickupDate][item.product] = products[item.status][pickupDate][item.product] || {
                    quantity: 0,
                    status: item.status,
                    product,
                    pickupDate
                };

                products[item.status][pickupDate][item.product].quantity += item.quantity;
            }
        }

        //console.log(["renderProductsTable : result products", products]);

        // Sort.
        let results = [];

        for(let status of Object.keys(products)) {
            for(let date of Object.keys(products[status])) {
                results = results.concat(Object.values(products[status][date]));
            }
        }

        results = lodash.orderBy(results, [(result) => {
            return result.status == "pending" ? 0 : 1;
        }, (result) => {
            return result.pickupDate;
        }], ["asc", "desc"]);

        //console.log(["renderProductsTable : final results", results]);

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
                        {results.length ? (
                            lodash.map(results, (result) => {
                                let productMainProfileImage = fileData[result.product.mainProfileImage];

                                return (
                                    <tr key={result.product._id}>
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
                                            {result.product.supplyType == "on_demand" ? (
                                                <i18n.Moment date={result.pickupDate} format="date" />
                                            ) : "-"}
                                        </td>
                                        <td>{result.product.name}</td>
                                        <td>{result.quantity}</td>

                                        <td>
                                            {result.product.supplyType == "on_demand" ? (
                                                result.status == "pending" ? (
                                                    <Label color="#eeeeee" scale={0.8}>{result.status}</Label>
                                                ) : result.status == "ready" ? (
                                                    <Label color="moody" scale={0.8} onClick={this.setItemStateForProduct(result.product._id, "stocked")}>{result.status}</Label>
                                                ) : result.status == "stocked" ? (
                                                    <Label color="#F9690E" scale={0.8}>{result.status}</Label>
                                                ) : null
                                            ) : (
                                                <Label color="#F9690E" scale={0.8}>stocked</Label>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : null}
                    </tbody>
                </table>
            </div>
        );
    }

    filterWithinWeek() {
        if(this.state.filtering){return;}
        
        this.setState({filtering: true});

        let query = lodash.cloneDeep(this.props.ordersQuery);

        if(query.createdAt) {
            delete query.createdAt;
        }
        else {
            query.createdAt = {
                gte: moment().subtract(1,"week").day("Saturday").startOf("day").toISOString(), // from last saturday
                lte: moment().day("Friday").endOf("day").toISOString() // to next friday
            };
        }

        Redux.dispatch(Order.actions.orderFind(query, {
            scope: {id: "adminOrders"}
        })).then(() => {
            this.setState({filtering: false});
        });
    }

    filterOpenStatus() {
        if(this.state.filtering){return;}

        this.setState({filtering: true});

        let query = lodash.cloneDeep(this.props.ordersQuery);

        if(query.status) {
            delete query.status;
        }
        else {
            query.status = "open";
        }

        Redux.dispatch(Order.actions.orderFind(query, {
            scope: {"id": "adminOrders"}
        })).then(() => {
            this.setState({filtering: false});
        });
    }

    render() {
        let {filtering, showProducts} = this.state;
        let {ordersQuery} = this.props;

        console.log(["render admin orders", this.props.orders]);

        return (
            <div>
                <Container>
                    <h2 style={{marginTop: "30px"}}>
                        <i18n.Translate text="_ADMIN_ORDERS_PAGE_TITLE_" /><span style={{marginLeft: "15px"}}><Label color="#F9690E" scale={0.8} layout="outlined">admin</Label></span>
                    </h2>

                    <div className={styles.filtersContainer}>
                        {filtering ? (<Spinner.CircSide scale={0.8} color="moody" />) : null}

                        <Label scale={0.8} color={showProducts?"moody":"#eeeeee"} onClick={() => {this.setState({showProducts: !showProducts});}}>
                            <i18n.Translate text="_ADMIN_ORDERS_PAGE_FILTER_ONLY_PRODUCTS_" />
                        </Label>

                        <Label scale={0.8} color={ordersQuery && ordersQuery.createdAt?"moody":"#eeeeee"} onClick={this.filterWithinWeek}>
                            <i18n.Translate text="_ADMIN_ORDERS_PAGE_FILTER_WITHIN_WEEK_ORDERS_" />
                        </Label>

                        <Label scale={0.8} color={ordersQuery && ordersQuery.status?"moody":"#eeeeee"} onClick={this.filterOpenStatus}>
                            <i18n.Translate text="_ADMIN_ORDERS_PAGE_FILTER_OPEN_ORDERS_" />
                        </Label>
                    </div>

                    {showProducts ? this.renderProductsTable() : this.renderOrdersTable()}
                </Container>
            </div>
        );
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component);

