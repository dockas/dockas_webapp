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
import Bar from "../bar";
import actions from "./actions";
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
        orders: state.adminOrders.data,
        ordersQuery: state.adminOrders.query
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

    statusSort = [
        "user_available",
        "confirmed",
        "boxed",
        "delivering",
        "closed"
    ];

    async componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        Redux.dispatch(actions.adminOrdersFind({
            populate: ["user","items[].product"],
            status: [ // all but closed
                "open", 
                "awaiting_user_availability", 
                "user_available", 
                "user_unavailable",
                "confirmed",
                "boxed",
                "delivering"
            ],
            createdAt: {
                gte: moment().subtract(1,"week").day("Saturday").startOf("day").toISOString(), // from last saturday
                lte: moment().day("Friday").endOf("day").toISOString() // to next friday
            }
        }));
    }

    onStatusUpdateClick(id, status) {
        return () => {
            Redux.dispatch(actions.adminOrdersStatusUpdate(id, status));
        };
    }

    getStatusClassName(order, status) {
        let logger = Logger.create("getStatusClassName");
        logger.info("enter", {orderStatus: order.status, status});

        let statusIdx = this.statusSort.indexOf(status);
        let orderStatusIdx = this.statusSort.indexOf(order.status);

        logger.debug("indexes", {statusIdx, orderStatusIdx});

        if(status == "awaiting_user_availability") {
            if(order.status == "awaiting_user_availability") {return styles.semiActive;}
            else if(order.status == "user_unavailable") { return styles.inactive; }
        }

        if(orderStatusIdx >= statusIdx) {
            return styles.active;
        }

        /*if(status == "awaiting_user_availability") {
            if(order.status == "awaiting_user_availability") {return styles.semiActive;}
            else if(order.status == "user_available") { return styles.active; }
            else if(order.status == "user_unavailable") { return styles.inactive; }
        }
        else if(order.status == status) {
            return styles.active;
        }*/
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
                                    return address.id = order.address;
                                });

                                return (
                                    <tr key={order._id}>
                                        <td>{order.user.fullName}</td>
                                        <td>{address.address}, {address.number} {address.complement||""} - {address.neighborhood} (<u>{address.phone}</u>)</td>
                                        <td><i18n.Number prefix="R$" numDecimals={2} value={order.totalPrice} /></td>
                                        <td>
                                            <i18n.Moment date={order.createdAt} />
                                        </td>
                                        
                                        <td>{order.status}</td>
                                        
                                        <td className={styles.buttonsContainer}>
                                            <a className={this.getStatusClassName(order, "awaiting_user_availability")} onClick={this.onStatusUpdateClick(order._id, "awaiting_user_availability")}><span className="icon-circled-question"></span></a>
                                            <a className={this.getStatusClassName(order, "confirmed")} onClick={this.onStatusUpdateClick(order._id, "confirmed")}><span className="icon-circled-ok"></span></a>
                                            <a className={this.getStatusClassName(order, "boxed")} onClick={this.onStatusUpdateClick(order._id, "boxed")}><span className="icon-circled-box"></span></a>
                                            <a className={this.getStatusClassName(order, "delivering")} onClick={this.onStatusUpdateClick(order._id, "delivering")}><span className="icon-circled-truck"></span></a>
                                            <a className={this.getStatusClassName(order, "closed")} onClick={this.onStatusUpdateClick(order._id, "closed")}><span className="icon-circled-thumbs-up"></span></a>
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

        Redux.dispatch(actions.adminOrdersFind(query)).then(() => {
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

        Redux.dispatch(actions.adminOrdersFind(query)).then(() => {
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

