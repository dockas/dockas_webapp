import React from "react";
import lodash from "lodash";
import {connect} from "react-redux";
import {LoggerFactory,Redux} from "darch/src/utils";
import Spinner from "darch/src/spinner";
import Container from "darch/src/container";
import i18n from "darch/src/i18n";
import {Order} from "common";
import styles from "./styles";

let Logger = new LoggerFactory("orders.list");

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        orders: lodash.get(state.order,"scope.myOrders.data"),
        ordersQuery: lodash.get(state.order,"scope.myOrders.query"),
        user: state.user.profiles[state.user.uid]
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
    static displayName = "orders.list";
    static defaultProps = {};
    static propTypes = {};

    state = {};

    async componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        let query = this.props.ordersQuery || {
            user: [this.props.user._id]
        };

        this.setState({initializing: true});

        try { 
            await Redux.dispatch(Order.actions.orderFind(query, {
                scope: {id: "myOrders"}
            })); 
        }
        catch(error) {
            logger.error("order action orderFind error", error);
        }

        this.setState({initializing: false});
    }

    render() {
        let {initializing} = this.state;
        let {orders,user} = this.props;

        return (
            <div>
                <Container>
                    <h2>
                        <i18n.Translate text="_ORDERS_PAGE_TITLE_" />
                    </h2>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th><i18n.Translate text="_ORDERS_PAGE_ID_TH_" /></th>
                                    <th><i18n.Translate text="_ORDERS_PAGE_CREATED_AT_TH_" /></th>
                                    <th><i18n.Translate text="_ORDERS_PAGE_ADDRESS_TH_" /></th>
                                    <th><i18n.Translate text="_ORDERS_PAGE_ITEMS_COUNT_TH_" /></th>
                                    <th><i18n.Translate text="_ORDERS_PAGE_PRICE_VALUE_TH_" /></th>
                                    <th><i18n.Translate text="_ORDERS_PAGE_STATUS_TH_" /></th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {initializing ? (
                                    <tr>
                                        <td colSpan="6" className={styles.infoCellContainer}><Spinner.CircSide color="moody" /></td>
                                    </tr>
                                ) : orders && orders.length ? (
                                    orders.map((order) => {
                                        let {address} = order;

                                        console.log(["order address maluco", order, address, user]);

                                        return (
                                            <tr key={order._id}>
                                                <td>{order.count}</td>
                                                <td><i18n.Moment date={order.createdAt} /></td>
                                                <td>{address.label}</td>
                                                <td>{order.items.length}</td>
                                                <td><i18n.Number prefix="R$" numDecimals={2} value={order.totalPrice/100} /></td>
                                                <td><i18n.Translate text={`_ORDER_STATUS_${lodash.toUpper(order.status)}_`}/></td>
                                                <td></td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className={styles.infoCellContainer}>
                                            <i18n.Translate text="_ORDERS_PAGE_NO_DATA_FOUND_TEXT_" />
                                        </td>
                                    </tr>
                                ) }
                            </tbody>
                        </table>
                    </div>
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

