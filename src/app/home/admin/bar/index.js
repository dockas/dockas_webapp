import React from "react"
import Container from "darch/src/container"
import {LoggerFactory} from "darch/src/utils"
import Tabs from "darch/src/tabs"
import i18n from "darch/src/i18n"
import styles from "./styles"

let Logger = new LoggerFactory("admin.page")

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "admin.page";
    static defaultProps = {};
    static propTypes = {};

    componentDidMount() {
        let logger = Logger.create("componentDidMount")
        logger.info("enter")
    }

    render() {
        return (
            <div className={styles.bar}>
                <Container>
                    <h2 style={{marginBottom: 0, marginTop: "30px"}}><i18n.Translate text="_ADMIN_BAR_TITLE_" /></h2>

                    <Tabs layout="simple" bordered={false}>
                        {/*<Tabs.Item to="/admin/products" onlyActiveOnIndex={true}><span className="icon-box-filled"></span><i18n.Translate text="_ADMIN_BAR_PRODUCTS_LABEL_" /></Tabs.Item>*/}
                        <Tabs.Item to="/admin/users"><span className="icon-user"></span><span className={styles.label}><i18n.Translate text="_ADMIN_BAR_USERS_LABEL_" /></span></Tabs.Item>
                        <Tabs.Item to="/admin/orders"><span className="icon-purchase-order"></span><span className={styles.label}><i18n.Translate text="_ADMIN_BAR_ORDERS_LABEL_" /></span></Tabs.Item>
                        <Tabs.Item to="/admin/invitations"><span className="icon-ticket"></span><span className={styles.label}><i18n.Translate text="_ADMIN_BAR_INVITATIONS_LABEL_" /></span></Tabs.Item>
                        <Tabs.Item to="/admin/notifications"><span className="icon-bell-2"></span><span className={styles.label}><i18n.Translate text="_ADMIN_BAR_NOTIFICATIONS_LABEL_" /></span></Tabs.Item>
                        <Tabs.Item to="/admin/coupons"><span className="icon-cutting-coupon"></span><span className={styles.label}><i18n.Translate text="_ADMIN_BAR_COUPONS_LABEL_" /></span></Tabs.Item>

                        {this.props.children}
                    </Tabs>
                </Container>
            </div>
        )
    }
}
