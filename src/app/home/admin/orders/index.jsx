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
//import Tabs from "darch/src/tabs";
import {Order} from "common";
import Bar from "../bar";
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
        orders: lodash.get(state.order,"scope.adminOrders.data"),
        ordersQuery: lodash.get(state.order,"scope.adminOrders.query")
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

    async componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        Redux.dispatch(Order.actions.orderFind({
            populate: ["user","items[].product"],
            status: [ // all but delivered
                Order.types.Status.PAYMENT_PENDING,
                Order.types.Status.PAYMENT_AUTHORIZED,
                Order.types.Status.PACKAGED,
                Order.types.Status.DELIVERING
            ],
            createdAt: {
                gte: moment().subtract(1,"week").day("Saturday").startOf("day").toISOString(), // from last saturday
                lte: moment().day("Friday").endOf("day").toISOString() // to next friday
            }
        }, {
            scope: {id: "adminOrders"}
        }));
    }

    onStatusUpdateClick(order, targetStatus) {
        return () => {
            let logger = Logger.create("onStatusUpdateClick");

            let orderStatusSeq = this.statusSequence.indexOf(order.status);
            let targetStatusSeq = this.statusSequence.indexOf(targetStatus);

            logger.info("enter", {orderStatusSeq,targetStatusSeq});

            // Prevent pass direct to a gratter status.
            if(targetStatusSeq != orderStatusSeq+1){return;}

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

    renderOrdersTable() {
        let {orders} = this.props;

        return (
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th><i18n.Translate text="_ADMIN_ORDERS_PAGE_USER_TH_" /></th>
                            <th><i18n.Translate text="_ADMIN_ORDERS_PAGE_ADDRESS_TH_" /></th>
                            <th><i18n.Translate text="_ADMIN_ORDERS_PAGE_PRICE_VALUE_TH_" /></th>
                            <th><i18n.Translate text="_ADMIN_ORDERS_PAGE_CREATED_AT_TH_" /></th>
                            <th><i18n.Translate text="_ADMIN_ORDERS_PAGE_STATUS_TH_" /></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders && orders.length ? (
                            orders.map((order) => {
                                let address = lodash.find(order.user.addresses, (address) => {
                                    return address._id = order.address;
                                });

                                let phoneAreaCode = lodash.get(address, "phone.areaCode")||""; 
                                let phoneNumber = lodash.get(address, "phone.number")||"";
                                let phone = `${phoneAreaCode}${phoneNumber}`;

                                return (
                                    <tr key={order._id}>
                                        <td>{order.user.fullName}</td>
                                        <td>{address.street}, {address.number} {address.complement||""} - {address.neighborhood} (<u>{phone}</u>)</td>
                                        <td style={{whiteSpace: "nowrap"}}><i18n.Number prefix="R$" numDecimals={2} value={order.totalPrice/100} /></td>
                                        <td>
                                            <i18n.Moment date={order.createdAt} />
                                        </td>
                                        
                                        <td>{order.status}</td>
                                        
                                        <td className={styles.buttonsContainer}>
                                            {this.statusSequence.map((status) => {
                                                let isActive = this.isStatusActive(status, order.status);
                                                let isDisabled = isActive || [Order.types.Status.PAYMENT_PENDING,Order.types.Status.PAYMENT_AUTHORIZED].indexOf(status) >= 0;

                                                return (
                                                    <a key={status} title={i18n.utils.translate({text: `_ORDER_STATUS_${lodash.toUpper(status)}_`})} className={isActive?styles.active:""} disabled={isDisabled} onClick={this.onStatusUpdateClick(order, status)}><span className={this.statusIconClassMap[status]}></span></a>
                                                );
                                            })}
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

    renderProductsTable() {
        let products = {};

        for(let order of this.props.orders||[]) {
            //console.log(["order",order]);

            for(let item of order.items) {
                //console.log(["item",item]);

                products[item.product._id] = products[item.product._id] || {
                    quantity: 0,
                    data: item.product
                };

                products[item.product._id].quantity += item.quantity;
            }
        }

        return (
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th><i18n.Translate text="_ADMIN_ORDERS_PAGE_PRODUCT_NAME_TH_" /></th>
                            <th><i18n.Translate text="_ADMIN_ORDERS_PAGE_PRODUCT_COUNT_TH_" /></th>
                        </tr>
                    </thead>
                    <tbody>
                        {lodash.size(products) ? (
                            lodash.map(products, (product) => {
                                return (
                                    <tr key={product.data._id}>
                                        <td>
                                            <div className={styles.productImage} style={{
                                                backgroundImage: `url(//${config.hostnames.file}/images/${product.data.mainImage})`,
                                                backgroundSize: "cover",
                                                backgroundPosition: "center"
                                            }}></div>
                                        </td>
                                        <td>{product.data.name}</td>
                                        <td>{product.quantity}</td>
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

        return (
            <div>
                <Bar />

                <Container>
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

