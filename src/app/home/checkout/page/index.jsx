import React from "react";
import classNames from "classnames";
import {LoggerFactory} from "darch/src/utils";
import i18n from "darch/src/i18n";
import styles from "./styles";

let Logger = new LoggerFactory("checkout.page");

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "checkout.page";
    static defaultProps = {};
    static propTypes = {};

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");
    }

    render() {
        let {pathname} = this.props.location;

        return (
            <div className={styles.page}>
                <ul className={styles.progressSteps}>
                    <li className={pathname=="/checkout"?styles.active:""}>
                        <div className={styles.stepContainer}>
                            <div className={styles.stepBullete}></div>
                        </div>
                        <div className={styles.stepTitle}>
                            <i18n.Translate text="_CHECKOUT_PROGRESS_STEP_REVIEW_TEXT_" />
                        </div>
                    </li>
                    <li className={pathname=="/checkout/address"?styles.active:""}>
                        <div className={styles.stepContainer}>
                            <div className={classNames([styles.stepBar, styles.stepBarLeft])}></div>
                            <div className={styles.stepBullete}></div>
                        </div>
                        <div className={styles.stepTitle}>
                            <i18n.Translate text="_CHECKOUT_PROGRESS_STEP_ADDRESS_TEXT_" />
                        </div>
                    </li>
                    <li className={pathname=="/checkout/payment"?styles.active:""}>
                        <div className={styles.stepContainer}>
                            <div className={classNames([styles.stepBar, styles.stepBarLeft])}></div>
                            <div className={styles.stepBullete}></div>
                        </div>
                        <div className={styles.stepTitle}>
                            <i18n.Translate text="_CHECKOUT_PROGRESS_STEP_PAYMENT_TEXT_" />
                        </div>
                    </li>
                    <li className={pathname=="/checkout/finilize"?styles.active:""}>
                        <div className={styles.stepContainer}>
                            <div className={classNames([styles.stepBar, styles.stepBarLeft])}></div>
                            <div className={styles.stepBullete}></div>
                        </div>
                        <div className={styles.stepTitle}>
                            <i18n.Translate text="_CHECKOUT_PROGRESS_STEP_FINALIZE_TEXT_" />
                        </div>
                    </li>
                </ul>

                {this.props.children}
            </div>
        );
    }
}
