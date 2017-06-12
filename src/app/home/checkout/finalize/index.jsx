import React from "react";
import config from "config";
import lodash from "lodash";
import {LoggerFactory,Redux} from "darch/src/utils";
import i18n from "darch/src/i18n";
import Container from "darch/src/container";
import {Basket} from "common";
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

        // Now we can clear the basket
        Redux.dispatch(Basket.actions.basketClear());
    }

    onBasketButtonClick() {
        let logger = Logger.create("onBasketButtonClick");
        logger.info("enter");
    }

    render() {
        let {support} = config;
        let selectedSupport = support[lodash.random(0, support.length-1)];

        return (
            <div className={styles.page}>
                <Container>
                    <h3><i18n.Translate text="_CHECKOUT_STEP_FINALIZE_TITLE_" /></h3>

                    <i18n.Translate text="_CHECKOUT_STEP_FINALIZE_BODY_" data={selectedSupport} />
                </Container>
            </div>
        );
    }
}
