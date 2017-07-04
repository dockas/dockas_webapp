import React from "react";
import {connect} from "react-redux";
import config from "config";
import moment from "moment";
import lodash from "lodash";
import {LoggerFactory} from "darch/src/utils";
import Spinner from "darch/src/spinner";
import Label from "darch/src/label";
import i18n from "darch/src/i18n";
import {Api} from "common";
import styles from "./styles";

let Logger = new LoggerFactory("brand.detail.orders");

/**
 * Redux map state to props function.
 *
 * @param {object} state
 * @param {object} ownProps
 */
function mapStateToProps(state) {
    return {
        brandData: state.brand.data,
        brandNameIdToId: state.brand.nameIdToId,
        orderData: state.order.data,
        orderScopeIds: lodash.get(state.order,"scope.brandOrders.ids"),
        orderScopeQuery: lodash.get(state.order,"scope.brandOrders.query"),
        uid: state.user.uid,
        user: state.user.uid?state.user.data[state.user.uid]:null
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
    static displayName = "brand.detail.orders";
    static defaultProps = {};
    static propTypes = {};

    state = {};

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
        let newState = {initializing: false},
            {brand} = this.getScopeData(),
            logger = Logger.create("componentDidMount");
        logger.info("enter");

        this.setState({initializing: true});

        try {
            let response = await Api.shared.brandOrdersFind(brand._id, {
                status: ["payment_authorized"],
                deliverDate: {
                    gte: moment().startOf("isoWeek").startOf("day").toISOString(),
                    lte: moment().endOf("isoWeek").endOf("day").toISOString()
                }
            });

            logger.info("api brandOrdersFind success", response);

            newState.requests = response.results;
        }
        catch(error) {
            logger.error("api brandOrdersFind error", error);
        }

        this.setState(newState);
    }

    updateOrderItemStatus(request) {
        return async () => {
            let promises = [],
                {brand} = this.getScopeData(),
                logger = Logger.create("componentDidMount");

            logger.info("enter");

            for(let order of request.orders) {
                promises.push(Api.shared.orderItemStatusUpdate(
                    order,
                    request.product._id,
                    request.status == "pending" ? "ready" : "pending"
                ));
            }

            try {
                let responses = await Promise.all(promises);
                logger.info("api orderItemStatusUpdate all success", responses);
            }
            catch(error) {
                logger.error("api orderItemStatusUpdate all error", error);
            }

            // Refresh
            try {
                let response = await Api.shared.brandOrdersFind(brand._id, {
                    status: ["payment_authorized"],
                    deliverDate: {
                        gte: moment().startOf("isoWeek").startOf("day").toISOString(),
                        lte: moment().endOf("isoWeek").endOf("day").toISOString()
                    }
                });

                logger.info("api brandOrdersFind success", response);

                this.setState({requests: response.results});
            }
            catch(error) {
                logger.error("api brandOrdersFind error", error);
            }
        };
    }

    render() {
        let {initializing,requests} = this.state;

        return (
            <div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>coleta</th>
                                <th>produto</th>
                                <th>quantidade</th>
                                <th>valor</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {initializing ? (
                                <tr>
                                    <td colSpan="6" className={styles.infoCellContainer}><Spinner.CircSide color="moody" /></td>
                                </tr>
                            ) : requests && requests.length ? (
                                requests.map((request) => {
                                    return (
                                        <tr key={request.product._id}>
                                            <td>
                                                <div className={styles.productImage} style={{
                                                    backgroundImage: `url(//${config.hostnames.file}/images/${request.product.mainProfileImage.path})`,
                                                    backgroundSize: "cover",
                                                    backgroundPosition: "center"
                                                }}></div>
                                            </td>
                                            <td><i18n.Moment date={request.pickupDate} format="date" /></td>
                                            <td>{request.product.name}</td>
                                            <td>{request.quantity}</td>
                                            <td style={{whiteSpace: "nowrap"}}><i18n.Number prefix="R$" numDecimals={2} value={request.totalPrice/100} /></td>
                                            <td style={{whiteSpace: "nowrap"}}>
                                                {["pending","ready"].indexOf(request.status) >= 0 ? (
                                                    <Label scale={0.8} color={request.status=="ready"?"moody":"#eeeeee"} onClick={this.updateOrderItemStatus(request)}>{request.status}</Label>
                                                ) : (
                                                    <Label scale={0.8} color="#000000">{request.status}</Label>
                                                )}
                                            </td>
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
            </div>
        );
    }
}

/** Export **/
export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Component);
