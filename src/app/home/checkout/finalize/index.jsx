import React from "react";
import {LoggerFactory} from "darch/src/utils";
//import {Basket} from "common";
import styles from "./styles";

let Logger = new LoggerFactory("checkout.finalize");

/**
 * Main component class.
 */
export default class Component extends React.Component {
    /** React properties **/
    static displayName = "checkout.finalize";
    static defaultProps = {};
    static propTypes = {};

    componentDidMount() {
        let logger = Logger.create("componentDidMount");
        logger.info("enter");
    }

    onBasketButtonClick() {
        let logger = Logger.create("onBasketButtonClick");
        logger.info("enter");
    }

    render() {
        return (
            <div className={styles.page}>
                Finalizar
            </div>
        );
    }
}
