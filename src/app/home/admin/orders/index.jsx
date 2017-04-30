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
import Tabs from "darch/src/tabs";
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

    async componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        Redux.dispatch(actions.adminOrdersFind({
            populate: ["user","items[].product"],
            status: "open",
            createdAt: {
                lower: moment().subtract(1,"week").day("Saturday").startOf("day").toISOString(), // from last saturday
                upper: moment().day("Friday").endOf("day").toISOString() // to next friday
            }
        }));
    }

    renderOrdersTable() {
        let {orders} = this.props;

        return (
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
                                    <td>{address.address}, {address.number} {address.complement||""} - {address.neighborhood}</td>
                                    <td><i18n.Number prefix="R$" numDecimals={2} value={order.totalPrice} /></td>
                                    <td>
                                        <i18n.Moment date={order.createdAt} />
                                    </td>
                                    
                                    <td>{order.status}</td>
                                    <td></td>
                                </tr>
                            );
                        })
                    ) : null}
                </tbody>
            </table>
        );
    }

    renderProductsTable() {
        let products = {};

        for(let order of this.props.orders||[]) {
            console.log(["order",order]);

            for(let item of order.items) {
                console.log(["item",item]);

                products[item.product._id] = products[item.product._id] || {
                    count: 0,
                    data: item.product
                };

                products[item.product._id].count += item.count;
            }
        }

        return (
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
                                    <td>{product.count}</td>
                                </tr>
                            );
                        })
                    ) : null}
                </tbody>
            </table>
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
                lower: moment().subtract(1,"week").day("Saturday").startOf("day").toISOString(), // from last saturday
                upper: moment().day("Friday").endOf("day").toISOString() // to next friday
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
                <Bar>
                    <Tabs.Item align="right" color="moody" to="/admin/create/product"><i18n.Translate text="_ADMIN_BAR_ORDERS_SEND_ACTION_LABEL_" /></Tabs.Item>
                </Bar>

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

