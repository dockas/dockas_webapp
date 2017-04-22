import React from "react";
import lodash from "lodash";
import {LoggerFactory} from "darch/src/utils";
import Container from "darch/src/container";
import i18n from "darch/src/i18n";
import {Api} from "common";
import Bar from "../bar";

let Logger = new LoggerFactory("admin.orders");

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "admin.orders";
    static defaultProps = {};
    static propTypes = {};

    state = {};

    async componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        let findResponse = await Api.shared.orderFind({populate: ["user"], status: "open"});

        console.log(["USERS", findResponse.results]);

        this.setState({
            orders: findResponse.results
        });
    }

    render() {
        return (
            <div>
                <Bar />
                
                <Container>
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
                            {this.state.orders && this.state.orders.length ? (
                                this.state.orders.map((order) => {
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
                </Container>
            </div>
        );
    }
}
