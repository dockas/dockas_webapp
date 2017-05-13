import React from "react";
//import lodash from "lodash";
import {LoggerFactory} from "darch/src/utils";
import Container from "darch/src/container";
import Spinner from "darch/src/spinner";
import i18n from "darch/src/i18n";
//import Toaster from "darch/src/toaster";
import Tabs from "darch/src/tabs";
import {Api} from "common";
import Bar from "../bar";
import styles from "./styles";

let Logger = new LoggerFactory("admin.coupons");

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "admin.coupons";
    static defaultProps = {};
    static propTypes = {};

    state = {};

    async componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");

        this.setState({initializing: true});

        let findResponse = await Api.shared.couponFind({
            sort: {createdAt: -1}
        });

        this.setState({
            initializing: false,
            coupons: findResponse.results
        });
    }

    render() {
        let {initializing,coupons} = this.state;

        return (
            <div>
                <Bar>
                    <Tabs.Item align="right" color="moody" to="/admin/create/coupon">
                        {/*<span className="icon-squared-plus"></span> */}<i18n.Translate text="_ADMIN_BAR_COUPONS_CREATE_ACTION_LABEL_" />
                    </Tabs.Item>
                </Bar>
                
                <Container>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th><i18n.Translate text="_ADMIN_COUPONS_PAGE_NAME_ID_TH_" /></th>
                                    <th><i18n.Translate text="_ADMIN_COUPONS_PAGE_MAX_APPLY_COUNT_TH_" /></th>
                                    <th><i18n.Translate text="_ADMIN_COUPONS_PAGE_APPLIERS_COUNT_TH_" /></th>
                                    <th><i18n.Translate text="_ADMIN_COUPONS_PAGE_VALUE_TH_" /></th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {initializing ? (
                                    <tr>
                                        <td colSpan="5" className={styles.infoCellContainer}><Spinner.CircSide color="moody" /></td>
                                    </tr>
                                ) : coupons && coupons.length ? (
                                    coupons.map((coupon) => {
                                        return (
                                            <tr key={coupon._id}>
                                                <td>{coupon.nameId}</td>
                                                <td>{coupon.maxApplyCount}</td>
                                                <td>{coupon.appliers.length}</td>
                                                <td>
                                                    {coupon.valueType == "monetary" ? (
                                                        <i18n.Number prefix="R$" value={parseFloat(coupon.value.toFixed(2))} numDecimals={2} />
                                                    ) : coupon.valueType == "percentual" ? (
                                                        <i18n.Number sufix="%" value={parseFloat(coupon.value.toFixed(2))} numDecimals={2} />
                                                    ) : coupon.value}
                                                </td>
                                                
                                                <td></td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className={styles.infoCellContainer}>
                                            <i18n.Translate text="_ADMIN_COUPONS_PAGE_NO_DATA_FOUND_TEXT_" />
                                        </td>
                                    </tr>
                                )}
                                
                            </tbody>
                        </table>
                    </div>
                </Container>
            </div>
        );
    }
}
