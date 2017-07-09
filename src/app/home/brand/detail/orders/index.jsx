import React from "react";
import {connect} from "react-redux";
import config from "config";
import moment from "moment";
import lodash from "lodash";
import {LoggerFactory,Redux} from "darch/src/utils";
import Spinner from "darch/src/spinner";
import Label from "darch/src/label";
import i18n from "darch/src/i18n";
import {OrderItem} from "common";
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
        fileData: state.file.data,
        productData: state.product.data,
        brandData: state.brand.data,
        brandNameIdToId: state.brand.nameIdToId,
        orderItemData: state.orderItem.data,
        orderItemScopeIds: lodash.get(state.orderItem,"scope.brandItems.ids"),
        orderItemScopeQuery: lodash.get(state.orderItem,"scope.brandItems.query"),
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

    state = {
        withinWeek: true
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

        // Load brand items.
        this.loadItems();
    }

    async loadItems() {
        let result,
            {brand} = this.getScopeData(),
            {withinWeek} = this.state,
            logger = Logger.create("loadItems");

        logger.info("enter", {brand, withinWeek});

        this.setState({loadingItems: true});

        let query = {
            brand: [brand._id],
            status: [
                OrderItem.types.Status.PENDING,
                OrderItem.types.Status.READY,
                OrderItem.types.Status.STOCKED
            ],
            sort: {statusPriority: -1, pickupDate: 1}
        };

        if(withinWeek) {
            query.deliverDate = {
                gte: moment().startOf("isoWeek").startOf("day").toISOString(),
                lte: moment().endOf("isoWeek").endOf("day").toISOString()
            };
        }

        logger.debug("query", query);

        result = await Redux.dispatch(
            OrderItem.actions.orderItemFind(query, {
                scope: {id: "brandItems"},
                populate: {
                    paths: ["product","product.mainProfileImage"]
                }
            })
        );

        logger.info("action orderItemFind success", result);

        // Find brand items 
        /*try {
        }
        catch(error) {
            logger.error("action orderItemFind error", error);
        }*/

        this.setState({loadingItems: false});
    }

    updateItemStatus(item) {
        return async () => {
            let result,
                logger = Logger.create("updateItemStatus");

            logger.info("enter", item);

            result = await Redux.dispatch(
                OrderItem.actions.orderItemUpdate(
                    item._id, 
                    {status: item.status == "pending" ? "ready" : "pending"}
                )
            );

            logger.info("action orderItemUpdate success", result);

            // Find brand items 
            /*try {
                result = await Redux.dispatch(
                    OrderItem.actions.orderItemUpdate(item._id, {
                        status: item.status == "pending" ? "ready" : "pending"
                    })
                );

                logger.info("action orderItemUpdate success", result);
            }
            catch(error) {
                logger.error("action orderItemUpdate error", error);
            }*/
        };
    }

    render() {
        let {fileData,productData,orderItemData,orderItemScopeIds} = this.props;
        let {loadingItems,withinWeek} = this.state;

        return (
            <div>
                <div className="table-container">
                    <div className={styles.filtersContainer}>
                        {loadingItems ? (<Spinner.CircSide scale={0.8} color="moody" />) : null}

                        <Label scale={0.8} color={withinWeek?"moody":"#eeeeee"} onClick={() => {this.setState({withinWeek: !withinWeek}, this.loadItems);}}>
                            <i18n.Translate text="_ADMIN_ORDERS_PAGE_FILTER_WITHIN_WEEK_ORDERS_" />
                        </Label>
                    </div>

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
                            {!orderItemScopeIds && loadingItems ? (
                                <tr>
                                    <td colSpan="5" style={{textAlign: "center"}}>loading</td>
                                </tr>
                            ) : orderItemScopeIds && orderItemScopeIds.length ? (
                                orderItemScopeIds.map((itemId) => {
                                    let item = orderItemData[itemId];
                                    let product = item?productData[item.product]:null;
                                    let productMainProfileImage = product?fileData[product.mainProfileImage]:null;

                                    return item ? (
                                        <tr key={item._id}>
                                            <td>
                                                {productMainProfileImage ? (
                                                    <div className={styles.productImage} style={{
                                                        backgroundImage: `url(//${config.hostnames.file}/images/${productMainProfileImage.path})`,
                                                        backgroundSize: "cover",
                                                        backgroundPosition: "center"
                                                    }}></div>
                                                ) : null}
                                            </td>
                                            <td>{item.pickupDate ? <i18n.Moment date={item.pickupDate} format="date" /> : "-"}</td>
                                            <td>{product?product.name:null}</td>
                                            <td>{item.quantity}</td>
                                            <td style={{whiteSpace: "nowrap"}}><i18n.Number prefix="R$" numDecimals={2} value={item.totalPrice/100} /></td>
                                            <td style={{whiteSpace: "nowrap"}}>
                                                {["pending","ready"].indexOf(item.status) >= 0 ? (
                                                    <Label scale={0.8} color={item.status=="ready"?"moody":"#eeeeee"} onClick={this.updateItemStatus(item)}>{item.status}</Label>
                                                ) : (
                                                    <Label scale={0.8} color="#000000">{item.status}</Label>
                                                )}
                                            </td>
                                        </tr>
                                    ) : (
                                        <tr key={itemId}></tr>
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
